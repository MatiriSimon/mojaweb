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

        return NextResponse.json({
            status: 200,
            message: "IPN received successfully",
            orderTrackingId,
            orderMerchantReference,
            statusResponse,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500});
        }
}

