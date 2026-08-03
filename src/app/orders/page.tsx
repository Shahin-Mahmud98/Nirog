import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-mint text-inksoft",
  CONFIRMED: "bg-teal-light text-teal-deep",
  PROCESSING: "bg-teal-light text-teal-deep",
  SHIPPED: "bg-[#E6F1FB] text-[#185FA5]",
  DELIVERED: "bg-[#EAF3DE] text-[#3B6D11]",
  CANCELLED: "bg-[#FCEBEB] text-redx",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Your orders</h1>
      {orders.length === 0 ? (
        <p className="text-inksoft text-sm">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order: { id: string; orderNumber: string; status: string; items: Array<{ id: string }>; total: number; createdAt: Date }) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white border border-line rounded-xl2 p-4 hover:border-teal-deep"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-inksoft">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""} · ৳{order.total}
              </p>
              <p className="text-xs text-inksoft mt-1">
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
