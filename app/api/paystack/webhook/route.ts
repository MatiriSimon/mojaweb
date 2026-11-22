import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    signatureBuffer.length !== expectedBuffer.length
    || !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = String(event.data?.reference ?? "");
  const amountKobo = Number(event.data?.amount ?? 0);
  const currency = String(event.data?.currency ?? "KES");

  if (!reference) return NextResponse.json({ error: "Missing reference" }, { status: 400 });

  const supabase = await createClient();
  const { data: donation } = await supabase
    .from("donations")
    .select("id, amount, currency")
    .eq("gateway_transaction_id", reference)
    .maybeSingle();

  if (!donation) return NextResponse.json({ error: "Donation not found" }, { status: 404 });

  if (Math.round(Number(donation.amount) * 100) !== amountKobo || String(donation.currency) !== currency) {
    return NextResponse.json({ error: "Amount or currency mismatch" }, { status: 400 });
  }

  const { error } = await supabase
    .from("donations")
    .update({ payment_status: "completed", gateway_transaction_id: reference })
    .eq("gateway_transaction_id", reference)
    .eq("payment_status", "pending");

  if (error) {
    console.error("Paystack webhook database update failed:", error);
    return NextResponse.json({ error: "Database update failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
