import { NextResponse } from "next/server";
import { verifyNagadPayment } from "@/lib/payments/nagad";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentRefId = searchParams.get("payment_ref_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!paymentRefId) {
    return NextResponse.redirect(`${appUrl}/checkout?payment=failed`);
  }

  const payment = await prisma.payment.findFirst({ where: { providerRef: paymentRefId } });
  if (!payment) {
    return NextResponse.redirect(`${appUrl}/checkout?payment=failed`);
  }

  const result = await verifyNagadPayment(paymentRefId);

  if (result.status === "Success") {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID", rawResponse: result as any },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      }),
    ]);
    return NextResponse.redirect(`${appUrl}/orders/${payment.orderId}?payment=success`);
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED", rawResponse: result as any },
  });
  return NextResponse.redirect(`${appUrl}/checkout?payment=failed`);
}
