// generates the access token and sends the STK Push request.

import { getMpesaBaseUrl, getMpesaConfig } from "./config";

interface InitiateStkPushParams {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

export async function getMpesaAccessToken(): Promise<string> {
  const config = getMpesaConfig();

  if (!config.consumerKey || !config.consumerSecret) {
    throw new Error("M-Pesa credentials are not configured.");
  }

  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  const response = await fetch(`${getMpesaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description ?? "Unable to obtain M-Pesa access token.");
  }

  return data.access_token as string;
}

export async function initiateStkPush(params: InitiateStkPushParams) {
  const config = getMpesaConfig();
  const token = await getMpesaAccessToken();
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
  const password = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: params.amount,
    PartyA: params.phone,
    PartyB: config.shortcode,
    PhoneNumber: params.phone,
    CallBackURL: params.callbackUrl ?? config.callbackUrl,
    AccountReference: params.accountReference,
    TransactionDesc: params.transactionDesc,
  };

  const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}
