import axios from "axios";
import crypto from "crypto";

/**
 * Nagad Payment Gateway (sandbox) integration.
 * Docs: https://developer.mynagad.com
 *
 * Unlike bKash, Nagad requires every request to be signed and sensitive
 * data encrypted with RSA keys issued to your merchant account during
 * onboarding (NAGAD_MERCHANT_PRIVATE_KEY to sign/encrypt what you send,
 * NAGAD_PG_PUBLIC_KEY to verify/decrypt what Nagad sends back).
 *
 * Flow:
 *   1. initialize()     -> handshake, returns a paymentReferenceId + challenge
 *   2. completeInitialization() -> send order details, get a checkout URL
 *   3. user pays on Nagad's hosted page, gets redirected back
 *   4. verifyPayment()  -> confirm final status server-side
 *
 * The signing/encryption below mirrors Nagad's documented shape. Before
 * going live, validate byte-for-byte against Nagad's reference Postman
 * collection with your real merchant keys — sandbox key formats can differ
 * slightly from what's issued in production.
 */

const BASE_URL = process.env.NAGAD_BASE_URL!;
const MERCHANT_ID = process.env.NAGAD_MERCHANT_ID!;
const PRIVATE_KEY = process.env.NAGAD_MERCHANT_PRIVATE_KEY!;
const PG_PUBLIC_KEY = process.env.NAGAD_PG_PUBLIC_KEY!;

function sign(data: string) {
  const signer = crypto.createSign("SHA256");
  signer.update(data);
  signer.end();
  return signer.sign(PRIVATE_KEY, "base64");
}

function encryptWithPgKey(data: string) {
  return crypto.publicEncrypt(
    { key: PG_PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(data)
  ).toString("base64");
}

export async function initializeNagadPayment({
  orderId,
  clientIp,
}: {
  orderId: string;
  clientIp: string;
}) {
  const dateTime = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const sensitiveData = JSON.stringify({
    merchantId: MERCHANT_ID,
    datetime: dateTime,
    orderId,
    challenge: crypto.randomBytes(16).toString("hex"),
  });

  const res = await axios.post(
    `${BASE_URL}/api/asyn/checkout/initialize/${MERCHANT_ID}/${orderId}`,
    {
      dateTime,
      sensitiveData: encryptWithPgKey(sensitiveData),
      signature: sign(sensitiveData),
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-KM-IP-V4": clientIp,
        "X-KM-Client-Type": "PC_WEB",
      },
    }
  );

  return res.data as { paymentReferenceId: string; challenge: string };
}

export async function completeNagadInitialization({
  paymentReferenceId,
  challenge,
  orderId,
  amountInTaka,
  callbackUrl,
  clientIp,
}: {
  paymentReferenceId: string;
  challenge: string;
  orderId: string;
  amountInTaka: number;
  callbackUrl: string;
  clientIp: string;
}) {
  const payload = JSON.stringify({
    merchantId: MERCHANT_ID,
    orderId,
    amount: amountInTaka.toFixed(2),
    currencyCode: "050",
    challenge,
  });

  const res = await axios.post(
    `${BASE_URL}/api/asyn/checkout/complete/${paymentReferenceId}`,
    {
      sensitiveData: encryptWithPgKey(payload),
      signature: sign(payload),
      merchantCallbackURL: callbackUrl,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-KM-IP-V4": clientIp,
        "X-KM-Client-Type": "PC_WEB",
      },
    }
  );

  // res.data.callBackUrl is where to redirect the customer to complete payment.
  return res.data as { callBackUrl: string; [key: string]: unknown };
}

export async function verifyNagadPayment(paymentReferenceId: string) {
  const res = await axios.get(
    `${BASE_URL}/api/asyn/bill/payment/status/${paymentReferenceId}`
  );
  // res.data.status will be "Success" on completion.
  return res.data as { status: string; issuerPaymentRefNo?: string; [key: string]: unknown };
}
