import axios from "axios";

/**
 * bKash Tokenized Checkout (sandbox) integration.
 * Docs: https://developer.bka.sh/docs/tokenized-checkout-url-issue
 *
 * Flow:
 *   1. grantToken()      -> get an id_token using app key/secret + username/password
 *   2. createPayment()   -> get a bkashURL to redirect the user to
 *   3. user pays on bKash's hosted page, gets redirected back with paymentID
 *   4. executePayment()  -> finalize and confirm the transaction
 *
 * Credentials in .env are sandbox test values from developer.bka.sh — replace
 * with live credentials (and the live base URL) once bKash approves your
 * merchant account for production.
 */

const BASE_URL = process.env.BKASH_BASE_URL!;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function grantToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const res = await axios.post(
    `${BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: process.env.BKASH_APP_KEY,
      app_secret: process.env.BKASH_APP_SECRET,
    },
    {
      headers: {
        username: process.env.BKASH_USERNAME,
        password: process.env.BKASH_PASSWORD,
        "Content-Type": "application/json",
      },
    }
  );

  const token = res.data.id_token as string;
  const expiresInSec = res.data.expires_in ?? 3600;
  cachedToken = { token, expiresAt: Date.now() + (expiresInSec - 60) * 1000 };
  return token;
}

export async function createBkashPayment({
  orderId,
  orderNumber,
  amountInTaka,
  callbackUrl,
}: {
  orderId: string;
  orderNumber: string;
  amountInTaka: number;
  callbackUrl: string;
}) {
  const token = await grantToken();

  const res = await axios.post(
    `${BASE_URL}/tokenized/checkout/create`,
    {
      mode: "0011",
      payerReference: orderNumber,
      callbackURL: callbackUrl,
      amount: amountInTaka.toFixed(2),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: orderNumber,
    },
    {
      headers: {
        Authorization: token,
        "X-APP-Key": process.env.BKASH_APP_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  // res.data.bkashURL is where the customer should be redirected to pay.
  // res.data.paymentID must be stored so it can be executed after redirect.
  return res.data as { bkashURL: string; paymentID: string; [key: string]: unknown };
}

export async function executeBkashPayment(paymentID: string) {
  const token = await grantToken();

  const res = await axios.post(
    `${BASE_URL}/tokenized/checkout/execute`,
    { paymentID },
    {
      headers: {
        Authorization: token,
        "X-APP-Key": process.env.BKASH_APP_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  // res.data.transactionStatus will be "Completed" on success.
  return res.data as { transactionStatus: string; trxID?: string; [key: string]: unknown };
}
