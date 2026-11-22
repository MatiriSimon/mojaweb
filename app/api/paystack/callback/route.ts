import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPaystackTransaction } from "@/lib/paystack/paystack";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "http://localhost:3000";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference")
    ?? new URL(request.url).searchParams.get("trxref")
    ?? "";

  if (!reference) {
    return NextResponse.redirect(`${APP_URL}/?paystack_error=missing_reference`);
  }

  try {
    const transaction = await verifyPaystackTransaction(reference);
    const campaignId = String(transaction.metadata?.campaign_id ?? "");

    if (transaction.status !== "success") {
      if (campaignId) {
        return NextResponse.redirect(`${APP_URL}/campaigns/${encodeURIComponent(campaignId)}/donate?error=Payment%20was%20not%20completed`);
      }
      return NextResponse.redirect(`${APP_URL}/?paystack_error=payment_failed`);
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("donations")
      .update({
        payment_status: "completed",
        gateway_transaction_id: transaction.reference,
      })
      .eq("gateway_transaction_id", reference)
      .eq("payment_status", "pending");

    if (error) {
      console.error("Paystack callback database update failed:", error);
      return NextResponse.redirect(`${APP_URL}/?paystack_error=database_update_failed`);
    }

    if (campaignId) {
      return NextResponse.redirect(`${APP_URL}/campaigns/${encodeURIComponent(campaignId)}?paystack_success=1`);
    }

    return NextResponse.redirect(`${APP_URL}/?paystack_success=1`);
  } catch (error) {
    console.error("Paystack callback verification failed:", error);
    return NextResponse.redirect(`${APP_URL}/?paystack_error=verification_failed`);
  }
}
