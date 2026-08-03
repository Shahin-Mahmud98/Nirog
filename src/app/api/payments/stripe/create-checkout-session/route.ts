import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createStripeCheckoutSession } from "@/lib/payments/stripe";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const checkoutSession = await createStripeCheckoutSession({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountInTaka: order.total,
    customerEmail: session.user.email!,
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { providerRef: checkoutSession.id },
    create: {
      orderId: order.id,
      provider: "STRIPE",
      amount: order.total,
      providerRef: checkoutSession.id,
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
