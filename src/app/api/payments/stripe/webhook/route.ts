import { NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const orderId = checkoutSession.metadata?.orderId;
    if (orderId) {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "PAID", status: "CONFIRMED" },
        }),
        prisma.payment.update({
          where: { orderId },
          data: { status: "PAID", rawResponse: checkoutSession as any },
        }),
      ]);
    }
  }

  return NextResponse.json({ received: true });
}
