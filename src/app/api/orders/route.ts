import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
  addressId: z.string(),
  paymentProvider: z.enum(["COD", "STRIPE", "BKASH", "NAGAD"]),
  prescriptionId: z.string().optional(),
});

function generateOrderNumber() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NRG${Date.now().toString().slice(-6)}${rand}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be signed in to place an order." }, { status: 401 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { items, addressId, paymentProvider, prescriptionId } = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) } },
  });

  // Guard against a cart that includes a prescription-only product
  // without an approved prescription attached to the order.
  const needsRx = products.some((p: { requiresPrescription: boolean }) => p.requiresPrescription);
  if (needsRx) {
    if (!prescriptionId) {
      return NextResponse.json(
        { error: "One or more items require a prescription. Please upload one first." },
        { status: 400 }
      );
    }
    const prescription = await prisma.prescription.findUnique({ where: { id: prescriptionId } });
    if (!prescription || prescription.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Invalid prescription." }, { status: 400 });
    }
    if (prescription.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Your prescription is still under review. You'll be notified once it's approved." },
        { status: 400 }
      );
    }
  }

  let subtotal = 0;
  const orderItemsData = items.map((i) => {
    const product = products.find((p: { id: string }) => p.id === i.productId);
    if (!product) throw new Error("Product not found");
    subtotal += product.price * i.qty;
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: i.qty,
    };
  });

  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryFee;

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: (session.user as any).id,
      addressId,
      subtotal,
      deliveryFee,
      total,
      paymentProvider,
      paymentStatus: paymentProvider === "COD" ? "UNPAID" : "PENDING",
      prescriptionId,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  return NextResponse.json(order, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
