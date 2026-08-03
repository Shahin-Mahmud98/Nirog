"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProductFormValues = {
  name: string;
  slug: string;
  sub: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  categoryId: string;
  requiresPrescription: boolean;
};

export default function ProductForm({
  initial,
  productId,
}: {
  initial?: Partial<ProductFormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState<ProductFormValues>({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    sub: initial?.sub ?? "",
    description: initial?.description ?? "",
    price: initial?.price ?? 0,
    mrp: initial?.mrp ?? 0,
    stock: initial?.stock ?? 0,
    categoryId: initial?.categoryId ?? "",
    requiresPrescription: initial?.requiresPrescription ?? false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((cats) => {
        setCategories(cats);
        if (!form.categoryId && cats[0]) setForm((f) => ({ ...f, categoryId: cats[0].id }));
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const endpoint = productId ? `/api/admin/products/${productId}` : "/api/admin/products";
    const method = productId ? "PATCH" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        mrp: Number(form.mrp),
        stock: Number(form.stock),
      }),
    });

    setLoading(false);
    if (!res.ok) {
      setError("Could not save product. Check that all fields are filled correctly.");
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl2 p-5 space-y-3 max-w-lg">
      <input
        required
        placeholder="Product name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
      />
      <input
        required
        placeholder="URL slug (e.g. paracetamol-500mg)"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
      />
      <input
        required
        placeholder="Short subtitle (e.g. Strip of 10 tablets)"
        value={form.sub}
        onChange={(e) => setForm({ ...form, sub: e.target.value })}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
      />
      <textarea
        required
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={3}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
      />
      <div className="grid grid-cols-3 gap-3">
        <input
          required
          type="number"
          placeholder="Price (৳)"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
        />
        <input
          required
          type="number"
          placeholder="MRP (৳)"
          value={form.mrp || ""}
          onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
          className="border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
        />
        <input
          required
          type="number"
          placeholder="Stock"
          value={form.stock || ""}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          className="border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
        />
      </div>
      <select
        value={form.categoryId}
        onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
        className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.parent ? `— ${c.name}` : c.name}</option>
        ))}
      </select>
      <label className="flex items-center gap-2 text-sm text-inksoft">
        <input
          type="checkbox"
          checked={form.requiresPrescription}
          onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })}
        />
        Requires a prescription
      </label>
      {error && <p className="text-redx text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-teal-deep text-white font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-60"
      >
        {loading ? "Saving…" : productId ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
