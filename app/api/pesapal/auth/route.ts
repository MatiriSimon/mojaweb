 // Handles RequestToken from Pesapal.

import { getPesapalToken } from "@/lib/pesapal/pesapal";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        const token =await getPesapalToken();
        console.info("[Pesapal] Authentication succeeded.");
        return NextResponse.json({Success: true, token});

    } catch (error: unknown) {
        console.error("[Pesapal] Authentication failed:", error);
        const message = error instanceof Error ? error.message : "Pesapal authentication failed";
        return NextResponse.json({Success: false, error: message}, {status: 500 });
    }

}