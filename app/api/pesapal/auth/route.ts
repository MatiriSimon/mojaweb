// Handles RequestToken from Pesapal.

import { getPesapalToken } from "@/lib/pesapal/pesapal";
import { NextResponse } from "next/server";


export async function GET(){
    try {
        const token =await getPesapalToken();
        return NextResponse.json({Success: true, token});

    } catch (error: any) {
        return NextResponse.json({Success: false, error: error.message}, {status: 500 });
    }

}