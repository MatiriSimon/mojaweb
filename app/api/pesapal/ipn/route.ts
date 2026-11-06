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


/*
// Handles Instant Payment Notifications (IPN) for transaction status updates.

import { NextResponse } from "next/server";
import { getTransactionStatus } from "@/lib/pesapal/pesapal";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderTrackingId = searchParams.get("orderTrackingId");
  const orderMerchantReference = searchParams.get("orderMerchantReference");

  try {
    if (!orderTrackingId) {
      return NextResponse.json(
        { error: "Missing orderTrackingID parameter" },
        { status: 400 }
      );
    }

    // Fetch the authoritative transaction status from Pesapal.
    const statusResponse = await getTransactionStatus(orderTrackingId);
    const description = String(
      statusResponse.payment_status_description ?? ""
    ).toLowerCase();

    const isComplete =
      String(statusResponse.status_code) === "1" ||
      description === "completed";

    const paymentStatus = isComplete
      ? "completed"
      : ["failed", "cancelled", "invalid"].includes(description)
        ? "failed"
        : "pending";

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("donations")
      .update({ payment_status: paymentStatus })
      .eq("pesapal_tracking_id", orderTrackingId)
      .select("id");

    if (error) {
      console.error("[Pesapal] Donation status update failed:", error);
      return NextResponse.json(
        { error: "Could not save Pesapal payment status" },
        { status: 500 }
      );
    }

    if (!data?.length) {
      console.error(
        "[Pesapal] No donation found for tracking ID:",
        orderTrackingId
      );
      return NextResponse.json(
        { error: "No donation found for Pesapal tracking ID" },
        { status: 404 }
      );
    }

    console.info("[Pesapal] IPN status retrieved and saved:", {
      orderTrackingId,
      paymentStatus,
      paymentStatusDescription: statusResponse.payment_status_description,
    });

    return NextResponse.json({
      status: 200,
      message: "IPN received successfully",
      orderTrackingId,
      orderMerchantReference,
      statusResponse,
    });
  } catch (error: unknown) {
    console.error("[Pesapal] IPN status lookup or update failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Pesapal status lookup or update failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
  */




/*
If you used POST to register your IPN, you also use POST to receive the IPN. 
POST is recommended for IPN because it allows for a larger payload and is more secure than GET.
The following is an example of how to handle the IPN using POST:


import { NextResponse, NextRequest } from "next/server";

// Helper to authenticate against Pesapal and retrieve a Bearer token
async function getPesapalAuthToken(): Promise<string> {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  const isLive = process.env.PESAPAL_ENV === "production";
  
  const authUrl = isLive
    ? "https://pay.pesapal.com/v3/api/Auth/RequestToken"
    : "https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken";

  const response = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Pesapal");
  }

  const data = await response.json();
  return data.token;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parse the incoming POST payload sent by Pesapal
    const body = await request.json();
    const { OrderTrackingId, OrderNotificationType, OrderMerchantReference } = body;

    if (!OrderTrackingId) {
      return NextResponse.json(
        { error: "Missing OrderTrackingId in IPN payload" },
        { status: 400 }
      );
    }

    console.log(`[Pesapal IPN] Received notification for Tracking ID: ${OrderTrackingId}, Reference: ${OrderMerchantReference}`);

    // 2. Authenticate and call Pesapal GetTransactionStatus to get the absolute source of truth
    const token = await getPesapalAuthToken();
    const isLive = process.env.PESAPAL_ENV === "production";
    
    const statusUrl = isLive
      ? `https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`
      : `https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`;

    const statusResponse = await fetch(statusUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!statusResponse.ok) {
      throw new Error("Failed to fetch transaction status from Pesapal");
    }

    const transactionDetails = await statusResponse.json();
    
    // Extracted fields from Pesapal verification response
    const {
      payment_status_description, // COMPLETED, FAILED, INVALID, REVERSED
      payment_method,             // MPESA, CARD, etc.
      amount,
      confirmation_code,          // M-Pesa or provider confirmation code
      merchant_reference
    } = transactionDetails;

    // 3. TODO: Update your internal database status based on payment_status_description
    // e.g., if (payment_status_description === 'COMPLETED') { markOrderAsPaid(...) }
    console.log(`[Pesapal Status Verification] Order ${merchant_reference} status: ${payment_status_description} (Code: ${confirmation_code})`);

    // 4. Respond back to Pesapal with the required acknowledgement format
    // Pesapal expects a confirmation JSON object containing the status code 200
    return NextResponse.json(
      {
        orderNotificationType: OrderNotificationType || "IPNCHANGE",
        orderTrackingId: OrderTrackingId,
        orderMerchantReference: OrderMerchantReference,
        status: 200,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Pesapal IPN Error]:", error);
    
    // Return status 500 if processing failed so Pesapal knows to retry later
    return NextResponse.json(
      { error: "Internal Server Error processing IPN" },
      { status: 500 }
    );
  }
}

*/
 