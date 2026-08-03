"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Deactivate this product? It will stop showing in the store.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="bg-teal-deep text-white text-sm font-semibold rounded-lg px-4 py-2 flex items-center gap-1.5">
          <Plus size={15} /> New product
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-inksoft">Loading…</p>
      ) : (
        <div className="bg-white border border-line rounded-xl2 divide-y divide-line">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <p className="text-sm font-semibold">{p.name} {!p.active && <span className="text-xs text-redx ml-1">(inactive)</span>}</p>
                <p className="text-xs text-inksoft">{p.category.name} · {p.sub}</p>
              </div>
              <span className="font-mono text-sm">৳{p.price}</span>
              <span className="text-xs text-inksoft w-20">Stock: {p.stock}</span>
              <Link href={`/admin/products/${p.id}`} className="text-teal-deep"><Pencil size={16} /></Link>
              <button onClick={() => handleDelete(p.id)} className="text-redx"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
