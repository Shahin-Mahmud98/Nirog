import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBkashPayment } from "@/lib/payments/bkash";

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

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/bkash/callback`;

  const result = await createBkashPayment({
    orderId: order.id,
    orderNumber: order.orderNumber,
    amountInTaka: order.total,
    callbackUrl,
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { providerRef: result.paymentID },
    create: {
      orderId: order.id,
      provider: "BKASH",
      amount: order.total,
      providerRef: result.paymentID,
    },
  });

  return NextResponse.json({ redirectUrl: result.bkashURL });
}
