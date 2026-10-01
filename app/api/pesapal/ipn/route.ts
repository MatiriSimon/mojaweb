// Handles Instant Payment Notifications (IPN) for transaction status updates.

export async function GET (request: Request) {
    const { searchParams } = new URL(request.url);
    const orderTrackingId = searchParams.get('orderTrackingId');
    const orderMerchantReference = searchParams.get('orderMerchantReference');

    try {
        if (!orderTrackingID) {
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
        return NextResponse.json({ error: erro.message }, { status: 500});
        }
}

