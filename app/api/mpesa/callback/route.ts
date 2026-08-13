import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";


// Define the shape of Safaricom's metadata item array elements
interface MpesaCallbackItem {
  Name: string;
  Value?: string | number | boolean;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));
    
    // Safaricom structures payload under Body.stkCallback
    const callback = payload?.Body?.stkCallback;
    if (!callback) {
      return NextResponse.json({ error: "Invalid callback structure" }, { status: 400 });
    }

    const resultCode = Number(callback.ResultCode);
    const resultDesc = String(callback.ResultDesc || "No description provided");
    const checkoutRequestId = callback.CheckoutRequestID;
    const paymentStatus = resultCode === 0 ? "completed" : "failed";

    // Extract transaction metadata properties if payment succeeded
    let mpesaReceiptNumber = null;
    if (resultCode === 0 && callback.CallbackMetadata?.Item) {
      const receiptItem = callback.CallbackMetadata.Item.find(
        (item: MpesaCallbackItem) => item.Name === "MpesaReceiptNumber"
      );
      if (receiptItem) mpesaReceiptNumber = receiptItem.Value;
    }

    const supabase = await createClient();

    // Safely update specific transaction matching your saved CheckoutRequestID tracking identifier
    /*
    if (checkoutRequestId) {
      await supabase
        .from("donations")
        .update({ 
          payment_status: paymentStatus,
          mpesa_receipt: mpesaReceiptNumber 
        })
        .eq("checkout_request_id", checkoutRequestId)
        .eq("payment_status", "pending");

        
        
    }
*/

/*
    if (checkoutRequestId) {
      const {data, error } = await supabase
        .from("donations")
        .update({
          payment_status: paymentStatus,
          mpesa_receipt: mpesaReceiptNumber,
        })
        .eq("checkout_request_id", checkoutRequestId)
        .eq("payment_status", "pending")
        .select("id");
        

        console.log("donations Supabase update result:",
          {
            checkoutRequestId,
            paymentStatus,
            mpesaReceiptNumber,
            error,
            rowsUpdated: data?.length || 0,
            data
       });
        
       if (error) {
        console.error("Supabase update error:", error);
      }   
        
  }
  */

     if (checkoutRequestId) {
      const { data, error, count } = await supabase
        .from("donations")
        .update({ 
          payment_status: paymentStatus,
          mpesa_receipt: mpesaReceiptNumber,
          gateway_transaction_id: mpesaReceiptNumber
        })
        .eq("checkout_request_id", checkoutRequestId)
        .eq("payment_status", "pending")
        .select("id"); // Add .select() to get proper count

      console.log("donations Supabase update result:", {
        checkoutRequestId,
        paymentStatus,
        mpesaReceiptNumber,
        error,
        rowsUpdated: count,
        data
      });

      if (error) {
        console.error("Supabase update error:", error);
      }
    }

    
    // Safaricom expects a specific JSON pattern returned back to acknowledge receipt
    console.log("Mpesa Receipt Number:", mpesaReceiptNumber);
    return NextResponse.json({
      MerchantRequestID: callback.MerchantRequestID,
      CheckoutRequestID: checkoutRequestId,
      ResultCode: 0,
      ResultDesc: resultDesc
    });

    
    
    
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}