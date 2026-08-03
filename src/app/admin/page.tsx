import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orderCount, productCount, pendingRx, revenueAgg, pendingOrders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.prescription.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "Total orders", value: orderCount },
    { label: "Active products", value: productCount },
    { label: "Pending prescriptions", value: pendingRx },
    { label: "Orders awaiting confirmation", value: pendingOrders },
    { label: "Revenue collected", value: `৳${revenueAgg._sum.total ?? 0}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-line rounded-xl2 p-4">
            <div className="font-display text-2xl font-semibold text-teal-deep">{s.value}</div>
            <div className="text-xs text-inksoft mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
