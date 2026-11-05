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