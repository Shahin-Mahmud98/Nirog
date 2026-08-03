"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

function taka(n: number) {
  return "৳" + n.toLocaleString("en-IN");
}

export default function CartPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const changeQty = useCartStore((s) => s.changeQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const lineArray = Object.values(lines);
  const subtotal = lineArray.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 60;
  const total = subtotal + deliveryFee;

  if (lineArray.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Your cart is empty</h1>
        <p className="text-inksoft mb-6 text-sm">Browse the catalog and add something you need.</p>
        <Link href="/products" className="bg-teal-deep text-white rounded-lg px-5 py-2.5 text-sm font-semibold">
          Browse products
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold mb-6">Your cart</h1>
      <div className="bg-white border border-line rounded-xl2 divide-y divide-line">
        {lineArray.map(({ product, qty }) => (
          <div key={product.id} className="flex items-center gap-4 p-4">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{product.name}</h4>
              <span className="text-xs text-inksoft">{product.sub}</span>
              {product.requiresPrescription && (
                <span className="block text-[11px] text-marigold-dark font-medium mt-0.5">Requires prescription</span>
              )}
            </div>
            <div className="flex items-center gap-3 border border-line rounded-lg px-2 py-1.5">
              <button onClick={() => changeQty(product.id, -1)}><Minus size={14} /></button>
              <span className="text-sm font-semibold w-4 text-center">{qty}</span>
              <button onClick={() => changeQty(product.id, 1)}><Plus size={14} /></button>
            </div>
            <span className="font-mono font-semibold w-20 text-right">{taka(product.price * qty)}</span>
            <button onClick={() => removeItem(product.id)} className="text-inksoft"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white border border-line rounded-xl2 p-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-inksoft">Subtotal</span>
          <span className="font-mono">{taka(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-inksoft">Delivery fee</span>
          <span className="font-mono">{deliveryFee === 0 ? "Free" : taka(deliveryFee)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold border-t border-line pt-3 mb-5">
          <span>Total</span>
          <span className="font-mono">{taka(total)}</span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="w-full bg-marigold text-[#3A2409] font-bold rounded-lg py-3"
        >
          Proceed to checkout
        </button>
      </div>
    </main>
  );
}
