// mpesa.ts - Handles M-Pesa Daraja API Integration
import { getMpesaBaseUrl, getMpesaConfig } from "./config";

interface InitiateStkPushParams {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl?: string;
}

// In-memory token cache variables
let cachedToken: string | null = null;
let tokenExpiryTime: number = 0;

/**
 * Normalizes phone numbers to the required Safaricom format (254XXXXXXXXX)
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.trim();
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // Strip all non-digit characters
  const digits = cleaned.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  // 2547XXXXXXXX or 2541XXXXXXXX
  if (digits.startsWith("254") && digits.length === 12) {
    return digits;
  }

  // 07XXXXXXXX or 01XXXXXXXX
  if (digits.startsWith("0") && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }

  // 7XXXXXXXX or 1XXXXXXXX
  if ((digits.startsWith("7") || digits.startsWith("1")) && digits.length === 9) {
    return `254${digits}`;
  }

  return digits;
}

/**
 * Generates an accurate YYYYMMDDHHmmss timestamp calibrated to East African Time (EAT)
 */
function getMpesaTimestamp(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  return `${map.year}${map.month}${map.day}${map.hour}${map.minute}${map.second}`;
}

/**
 * Fetches the M-Pesa OAuth Access Token and caches it for up to 1 hour
 */
export async function getMpesaAccessToken(): Promise<string> {
  const currentTime = Date.now();

  // Reuse the token if it exists and has more than 2 minutes of validity left
  if (cachedToken && currentTime < tokenExpiryTime - 120000) {
    return cachedToken;
  }

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

  cachedToken = data.access_token;
  // Convert expires_in (typically string "3599") to absolute Unix timestamp milliseconds
  tokenExpiryTime = currentTime + parseInt(data.expires_in) * 1000;

  return cachedToken as string;
}

/**
 * Initiates an M-Pesa Express STK Push prompt to the user's phone
 */
export async function initiateStkPush(params: InitiateStkPushParams) {
  const config = getMpesaConfig();
  const token = await getMpesaAccessToken();
  const timestamp = getMpesaTimestamp();
  const password = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");
  const phoneNumber = normalizePhoneNumber(params.phone);

  if (!phoneNumber) {
    throw new Error("A valid phone number is required.");
  }

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: params.amount,
    PartyA: phoneNumber,
    PartyB: config.shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: params.callbackUrl ?? config.callbackUrl,
    AccountReference: params.accountReference,
    TransactionDesc: params.transactionDesc,
  };

  console.log("M-Pesa STK push payload:", payload);

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

/**
 * Queries the status of an STK Push transaction using its CheckoutRequestID
 */
export async function queryTransactionStatus(checkoutRequestId: string) {
  const config = getMpesaConfig();
  const token = await getMpesaAccessToken();
  const timestamp = getMpesaTimestamp();
  const password = Buffer.from(`${config.shortcode}${config.passkey}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: config.shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await fetch(`${getMpesaBaseUrl()}/mpesa/stkpushquery/v1/query`, {
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