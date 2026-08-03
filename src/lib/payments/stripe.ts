import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * Creates a Stripe Checkout Session for card payments.
 * Amount is in Taka; Stripe expects the smallest currency unit, and since
 * BDT isn't a Stripe-supported settlement currency for most accounts, this
 * example bills in USD as a placeholder — swap `currency` and the amount
 * conversion for your actual settlement currency in production.
 */
export async function createStripeCheckoutSession({
  orderId,
  orderNumber,
  amountInTaka,
  customerEmail,
}: {
  orderId: string;
  orderNumber: string;
  amountInTaka: number;
  customerEmail: string;
}) {
  const amountInCents = Math.round(amountInTaka * 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Nirog order ${orderNumber}` },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    metadata: { orderId },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?payment=cancelled`,
  });

  return session;
}
