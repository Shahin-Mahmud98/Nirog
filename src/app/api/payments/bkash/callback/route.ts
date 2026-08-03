import { NextResponse } from "next/server";
import { executeBkashPayment } from "@/lib/payments/bkash";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const paymentID = searchParams.get("paymentID");
  const status = searchParams.get("status"); // "success" | "failure" | "cancel"

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!paymentID || status !== "success") {
    return NextResponse.redirect(`${appUrl}/checkout?payment=failed`);
  }

  const payment = await prisma.payment.findFirst({ where: { providerRef: paymentID } });
  if (!payment) {
    return NextResponse.redirect(`${appUrl}/checkout?payment=failed`);
  }

  const result = await executeBkashPayment(paymentID);

  if (result.transactionStatus === "Completed") {
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
