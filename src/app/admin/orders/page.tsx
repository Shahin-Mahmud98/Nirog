"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Orders</h1>
      {loading ? (
        <p className="text-sm text-inksoft">Loading…</p>
      ) : (
        <div className="bg-white border border-line rounded-xl2 divide-y divide-line">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center gap-4 p-4 flex-wrap">
              <Link href={`/orders/${order.id}`} className="font-mono text-sm font-semibold w-32">
                {order.orderNumber}
              </Link>
              <span className="text-sm text-inksoft flex-1 min-w-[120px]">{order.user.name}</span>
              <span className="font-mono text-sm w-20">৳{order.total}</span>
              <span className="text-xs text-inksoft w-28">
                {order.paymentProvider} · {order.paymentStatus}
              </span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="border border-line rounded-lg px-2 py-1.5 text-xs font-medium"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
