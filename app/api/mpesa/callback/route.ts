// receives Safaricom’s success/failure callback and updates the donation status.

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));

    return NextResponse.json({
      ok: true,
      received: true,
      payload,
      note: "Add your reconciliation logic here to update donations from the callback payload.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
