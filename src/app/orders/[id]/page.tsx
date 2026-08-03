import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";

export const dynamic = "force-dynamic";

const STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { payment?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, address: true, payment: true },
  });

  if (!order) return notFound();
  const isOwner = order.userId === (session.user as any).id;
  const isAdmin = (session.user as any).role === "ADMIN";
  if (!isOwner && !isAdmin) redirect("/orders");

  const currentStepIndex = STEPS.indexOf(order.status);

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      {searchParams.payment === "success" && (
        <div className="bg-[#EAF3DE] text-[#3B6D11] text-sm rounded-lg px-4 py-3 mb-5">
          Payment received — thanks for your order.
        </div>
      )}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Order {order.orderNumber}</h1>
          <p className="text-sm text-inksoft mt-1">
            Placed {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full bg-teal-light text-teal-deep">
          {order.status}
        </span>
      </div>

      {order.status !== "CANCELLED" && (
        <div className="bg-white border border-line rounded-xl2 p-5 mb-6">
          <div className="flex justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center relative">
                {i < STEPS.length - 1 && (
                  <div
                    className={`absolute top-2.5 left-1/2 w-full h-0.5 ${
                      i < currentStepIndex ? "bg-teal-deep" : "bg-line"
                    }`}
                  />
                )}
                {i <= currentStepIndex ? (
                  <CheckCircle2 size={20} className="text-teal-deep bg-white relative z-10" />
                ) : (
                  <Circle size={20} className="text-line bg-white relative z-10" />
                )}
                <span className="text-[11px] text-inksoft mt-2 text-center">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-line rounded-xl2 p-5 mb-4">
        <h3 className="font-semibold mb-3 text-sm">Items</h3>
        <div className="space-y-2">
          {order.items.map((item: { id: string; name: string; qty: number; price: number }) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-inksoft">{item.name} × {item.qty}</span>
              <span className="font-mono">৳{item.price * item.qty}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-line mt-3 pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span className="font-mono">৳{order.total}</span>
        </div>
      </div>

      <div className="bg-white border border-line rounded-xl2 p-5">
        <h3 className="font-semibold mb-2 text-sm">Delivery address</h3>
        <p className="text-sm text-inksoft">{order.address.label} — {order.address.line1}, {order.address.city}</p>
        <p className="text-sm text-inksoft">{order.address.phone}</p>
        <h3 className="font-semibold mb-1 mt-4 text-sm">Payment</h3>
        <p className="text-sm text-inksoft">{order.paymentProvider} · {order.paymentStatus}</p>
      </div>
    </main>
  );
}
