// optional, for checking the payment status later.

import { NextResponse } from "next/server";
import { queryTransactionStatus } from "@/lib/mpesa/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const checkoutRequestId = url.searchParams.get("checkoutRequestId");

  if (!checkoutRequestId) {
    return NextResponse.json({ error: "checkoutRequestId is required." }, { status: 400 });
  }

  const payment = await queryTransactionStatus(checkoutRequestId);

  return NextResponse.json({
    ok: payment.ok,
    checkoutRequestId,
    status: payment.status,
    data: payment.data,
  });
}
