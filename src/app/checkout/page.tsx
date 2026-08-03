"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart-store";

function taka(n: number) {
  return "৳" + n.toLocaleString("en-IN");
}

const PAYMENT_OPTIONS = [
  { id: "COD", label: "Cash on delivery", desc: "Pay when your order arrives" },
  { id: "BKASH", label: "bKash", desc: "Pay with your bKash wallet" },
  { id: "NAGAD", label: "Nagad", desc: "Pay with your Nagad wallet" },
  { id: "STRIPE", label: "Card", desc: "Visa, Mastercard via Stripe" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clearCart = useCartStore((s) => s.clear);
  const lineArray = Object.values(lines);

  const [form, setForm] = useState({ label: "Home", line1: "", city: "", phone: "" });
  const [payment, setPayment] = useState<(typeof PAYMENT_OPTIONS)[number]["id"]>("COD");
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const needsRx = lineArray.some((l) => l.product.requiresPrescription);
  const subtotal = lineArray.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 60;
  const total = subtotal + deliveryFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Save address
      const addrRes = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!addrRes.ok) throw new Error("Could not save address.");
      const address = await addrRes.json();

      // 2. Upload prescription if needed
      let prescriptionId: string | undefined;
      if (needsRx) {
        if (!prescriptionFile) throw new Error("Please upload a prescription for the items in your cart.");
        const fd = new FormData();
        fd.append("file", prescriptionFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) throw new Error((await uploadRes.json()).error ?? "Upload failed.");
        const { fileUrl } = await uploadRes.json();

        const rxRes = await fetch("/api/prescriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl }),
        });
        const rx = await rxRes.json();
        prescriptionId = rx.id;
      }

      // 3. Create order
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lineArray.map((l) => ({ productId: l.product.id, qty: l.qty })),
          addressId: address.id,
          paymentProvider: payment,
          prescriptionId,
        }),
      });
      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error ?? "Could not place order.");
      }
      const order = await orderRes.json();

      // 4. Route to the right payment flow
      if (payment === "COD") {
        clearCart();
        router.push(`/orders/${order.id}`);
        return;
      }

      const endpoint =
        payment === "STRIPE"
          ? "/api/payments/stripe/create-checkout-session"
          : payment === "BKASH"
          ? "/api/payments/bkash/create"
          : "/api/payments/nagad/create";

      const payRes = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const payData = await payRes.json();
      clearCart();
      window.location.href = payData.url ?? payData.redirectUrl;
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (lineArray.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16 text-center text-inksoft">
        Your cart is empty. Add products before checking out.
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-line rounded-xl2 p-5">
            <h3 className="font-semibold mb-3">Delivery address</h3>
            <div className="space-y-3">
              <input
                required
                placeholder="Label (e.g. Home, Office)"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
              />
              <input
                required
                placeholder="Full address"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
              />
              <input
                required
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
              />
              <input
                required
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-teal"
              />
            </div>
          </div>

          {needsRx && (
            <div className="bg-white border border-line rounded-xl2 p-5">
              <h3 className="font-semibold mb-2">Prescription</h3>
              <p className="text-xs text-inksoft mb-3">
                One or more items in your cart need a valid prescription. Upload a photo or PDF —
                our pharmacists will review it before your order is confirmed.
              </p>
              <input
                required
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                onChange={(e) => setPrescriptionFile(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
            </div>
          )}

          <div className="bg-white border border-line rounded-xl2 p-5">
            <h3 className="font-semibold mb-3">Payment method</h3>
            <div className="space-y-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 border rounded-lg px-3 py-2.5 cursor-pointer ${
                    payment === opt.id ? "border-teal-deep bg-teal-light" : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                  />
                  <div>
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-inksoft">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border border-line rounded-xl2 p-5 sticky top-24">
            <h3 className="font-semibold mb-3">Order summary</h3>
            <div className="space-y-2 mb-4">
              {lineArray.map((l) => (
                <div key={l.product.id} className="flex justify-between text-sm">
                  <span className="text-inksoft">{l.product.name} × {l.qty}</span>
                  <span className="font-mono">৳{l.product.price * l.qty}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-inksoft">Subtotal</span>
              <span className="font-mono">{taka(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3">
              <span className="text-inksoft">Delivery</span>
              <span className="font-mono">{deliveryFee === 0 ? "Free" : taka(deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t border-line pt-3 mb-5">
              <span>Total</span>
              <span className="font-mono">{taka(total)}</span>
            </div>
            {error && <p className="text-redx text-sm mb-3">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-marigold text-[#3A2409] font-bold rounded-lg py-3 disabled:opacity-60"
            >
              {loading ? "Placing order…" : "Place order"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
