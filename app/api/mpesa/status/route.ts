// optional, for checking the payment status later.

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const checkoutRequestId = url.searchParams.get("checkoutRequestId");

  if (!checkoutRequestId) {
    return NextResponse.json({ error: "checkoutRequestId is required." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    checkoutRequestId,
    message: "Status check endpoint scaffold. Replace this with a real Daraja status query when you are ready.",
  });
}
