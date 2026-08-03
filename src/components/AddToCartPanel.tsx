"use client";

import { Plus, Minus } from "lucide-react";
import { useCartStore } from "@/store/cart-store";

export default function AddToCartPanel({ product }: { product: any }) {
  const lines = useCartStore((s) => s.lines);
  const addItem = useCartStore((s) => s.addItem);
  const changeQty = useCartStore((s) => s.changeQty);
  const qty = lines[product.id]?.qty ?? 0;

  return (
    <div className="mt-6">
      {qty === 0 ? (
        <button
          onClick={() =>
            addItem({
              id: product.id,
              name: product.name,
              sub: product.sub,
              price: product.price,
              mrp: product.mrp,
              requiresPrescription: product.requiresPrescription,
            })
          }
          className="bg-teal-deep text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2 hover:bg-teal"
        >
          <Plus size={16} /> Add to cart
        </button>
      ) : (
        <div className="flex items-center gap-3 border border-teal-deep rounded-lg px-3 py-2 w-fit">
          <button onClick={() => changeQty(product.id, -1)} className="text-teal-deep"><Minus size={16} /></button>
          <span className="font-semibold w-6 text-center">{qty}</span>
          <button onClick={() => changeQty(product.id, 1)} className="text-teal-deep"><Plus size={16} /></button>
        </div>
      )}
    </div>
  );
}
