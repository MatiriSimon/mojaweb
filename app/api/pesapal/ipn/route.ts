// Handles Instant Payment Notifications (IPN) for transaction status updates.

import { NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/pesapal/pesapal"

export async function GET (request: Request) {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get('orderTrackingId');
    const orderMerchantReference = searchParams.get('orderMerchantReference');

    try {
        if (!orderTrackingId) {
            return NextResponse.json({ error: "Missing orderTrackingID parameter"}, {status: 400});
        }

        const statusResponse = await getTransactionStatus(orderTrackingId);
        console.info("[Pesapal] IPN status retrieved successfully:", {
            paymentStatus: statusResponse.payment_status_description,
        });

        return NextResponse.json({
            status: 200,
            message: "IPN received successfully",
            orderTrackingId,
            orderMerchantReference,
            statusResponse,
        })
    } catch (error: unknown) {
        console.error("[Pesapal] IPN status lookup failed:", error);
        const message = error instanceof Error ? error.message : "Pesapal status lookup failed";
        return NextResponse.json({ error: message }, { status: 500});
        }
}
