const PAYSTACK_API_URL = "https://api.paystack.co";

export interface PaystackInitializeResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export function getPaystackSecretKey(): string {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return secretKey;
}

export async function initializePaystackTransaction(payload: {
  email: string;
  amount: number;
  currency: string;
  callbackUrl: string;
  reference: string;
  metadata: Record<string, unknown>;
}) {
  const response = await fetch(`${PAYSTACK_API_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      amount: Math.round(payload.amount * 100),
      currency: payload.currency,
      callback_url: payload.callbackUrl,
      reference: payload.reference,
      metadata: payload.metadata,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Unable to initialize Paystack transaction.");
  }

  return data.data as PaystackInitializeResult;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `${PAYSTACK_API_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getPaystackSecretKey()}` },
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.status) {
    throw new Error(data.message || "Unable to verify Paystack transaction.");
  }

  return data.data as {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  };
}
