//  holds Daraja credentials and environment variables.

export type MpesaEnvironment = "sandbox" | "production";

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  environment: MpesaEnvironment;
  callbackUrl: string;
}

export function getMpesaConfig(): MpesaConfig {
  const environment = (process.env.MPESA_ENV ?? "sandbox") as MpesaEnvironment;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    consumerKey: process.env.MPESA_CONSUMER_KEY ?? "",
    consumerSecret: process.env.MPESA_CONSUMER_SECRET ?? "",
    shortcode: process.env.MPESA_SHORTCODE ?? "",
    passkey: process.env.MPESA_PASSKEY ?? "",
    environment,
    callbackUrl: process.env.MPESA_CALLBACK_URL ?? `${appUrl.replace(/\/$/, "")}/api/mpesa/callback`,
  };
}

export function getMpesaBaseUrl(): string {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}
