import { submitOrder } from "@/lib/pesapal/pesapal";
import { NextResponse } from "next/server";

// Submits order requests (amount, email, phone).
export async function POST(request: Request) {
    try {
    const body = await request.json();

    const orderPayload = {
        id: body.id,
        currency: body.currency || "KES",
        amount: body.amount,
        description: body.description || "Order Payment",
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/pesapal/response`,
        notification_id: process.env.PESAPAL_IPN_ID,
        billing_address: {
            email_address: body.email,
            phone_number: body.phone || "",
            first_name: body.firstName || "",
            last_name: body.lastName || "",           
        },

    };
    const response = await submitOrder(orderPayload);
    console.info("[Pesapal] Order submitted successfully.");
    return NextResponse.json({ success: true, data: response});

} catch (error: unknown) {
    console.error("[Pesapal] Order submission failed:", error);
    const message = error instanceof Error ? error.message : "Pesapal order submission failed";
    return NextResponse.json({ success: false, error: message}, { status: 500 });
    };
}