// Handles Pesapal’s callback URL after payment.
import { getTransactionStatus } from "@/lib/pesapal/pesapal";
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get('orderTrackingId');
    const orderMerchantReference = searchParams.get('orderMerchantReference');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';

    try {
        if (!orderTrackingId) {
            return NextResponse.redirect(`${baseUrl}/checkout/failed?error=missing_tracking_id`);
        }

        const statusResponse = await getTransactionStatus(orderTrackingId);
        const paymentComplete = statusResponse.status_code === '1'
            || statusResponse.payment_status_description === 'Completed';
        console.info("[Pesapal] Callback processed:", {
            paymentStatus: statusResponse.payment_status_description,
            paymentComplete,
        });

        if(paymentComplete) {
            return NextResponse.redirect(`${baseUrl}/checkout/success?trackingId=${orderTrackingId}&ref=${orderMerchantReference}`);
        } else {
            return NextResponse.redirect(`${baseUrl}/checkout/failed?trackingId=${orderTrackingId}&ref=${orderMerchantReference}`);
           
        } 

    } catch (error: unknown) {
        console.error("[Pesapal] Callback status lookup failed:", error);
        const message = error instanceof Error ? error.message : "Pesapal status lookup failed";
        return NextResponse.redirect(`${baseUrl}/checkout/failed?error=${encodeURIComponent(message)}`);
    }
}