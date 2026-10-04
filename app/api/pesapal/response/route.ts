// Handles Pesapal’s callback URL after payment.
import { getTransactionStatus } from "@/lib/pesapal/pesapal";
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get('orderTrackingId');
    const orderMerchantReference = searchParams.get('orderMerchantReference');

    const baseUrl = process.env.NEXT_PUBLIC_URL || '';

    try {
        if (!orderTrackingId) {
            return NextResponse.redirect(`${baseUrl}/checkout/failed?error=missing_tracking_id`);
        }

        const statusResponse = await getTransactionStatus(orderTrackingId);

        if(statusResponse.status_code === '1' || statusResponse.payment_status_descript
             === 'Completed') {
            return NextResponse.redirect(`${baseUrl}/checkout/success?trackingId=${orderTrackingId}&ref=${orderMerchantReference}`);
        } else {
            return NextResponse.redirect(`${baseUrl}/checkout/failed?trackingId=${orderTrackingId}&ref=${orderMerchantReference}`);
        } 

    } catch (error: any) {
            return NextResponse.redirect(`${baseUrl}/checkout/failed?error=${encodeURIComponent(error.message)}`);
        }
}