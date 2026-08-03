import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initializeNagadPayment, completeNagadInitialization } from "@/lib/payments/nagad";

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

  const clientIp = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/nagad/callback`;

  const init = await initializeNagadPayment({ orderId: order.id, clientIp });

  const complete = await completeNagadInitialization({
    paymentReferenceId: init.paymentReferenceId,
    challenge: init.challenge,
    orderId: order.id,
    amountInTaka: order.total,
    callbackUrl,
    clientIp,
  });

  await prisma.payment.upsert({
    where: { orderId: order.id },
    update: { providerRef: init.paymentReferenceId },
    create: {
      orderId: order.id,
      provider: "NAGAD",
      amount: order.total,
      providerRef: init.paymentReferenceId,
    },
  });

  return NextResponse.json({ redirectUrl: complete.callBackUrl });
}
