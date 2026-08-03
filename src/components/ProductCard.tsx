"use client";

import Link from "next/link";
import { Plus, Minus, Star } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { getCategoryIcon } from "@/lib/icons";

function taka(n: number) {
  return "৳" + n.toLocaleString("en-IN");
}

function tint(hex: string) {
  // Produces a light background tint from a category's brand color for the product image panel.
  return hex + "1A";
}

export default function ProductCard({ product }: { product: any }) {
  const lines = useCartStore((s) => s.lines);
  const addItem = useCartStore((s) => s.addItem);
  const changeQty = useCartStore((s) => s.changeQty);

  const qtyInCart = lines[product.id]?.qty ?? 0;
  const discount = Math.round((1 - product.price / product.mrp) * 100);
  const color = product.category?.bannerColor ?? "#0C5C4C";
  const Icon = getCategoryIcon(product.category?.icon);

  return (
    <div className="bg-white border border-line rounded-xl2 p-3.5 flex flex-col gap-2 relative">
      {discount > 0 && (
        <span className="absolute top-2.5 left-2.5 bg-redx text-white text-[10.5px] font-bold px-1.5 py-0.5 rounded">
          -{discount}%
        </span>
      )}
      {product.requiresPrescription && (
        <span className="absolute top-2.5 right-2.5 bg-white border border-line text-[10px] font-semibold px-1.5 py-0.5 rounded text-inksoft">
          Rx
        </span>
      )}
      <Link href={`/products/${product.slug}`}>
        <div
          className="rounded-lg flex flex-col items-center justify-center py-4"
          style={{ background: tint(color) }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-2"
            style={{ background: color }}
          >
            <Icon size={26} color="#fff" strokeWidth={1.6} />
          </div>
        </div>
        <h4 className="text-sm font-semibold mt-1">{product.name}</h4>
        <span className="text-xs text-inksoft">{product.sub}</span>
      </Link>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={12} fill={i <= Math.round(product.rating) ? "#E8983D" : "none"} color="#E8983D" />
        ))}
        <span className="text-[11px] text-inksoft ml-1">({product.reviewCount})</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-semibold text-teal-deep">{taka(product.price)}</span>
        {discount > 0 && <span className="font-mono text-xs text-inksoft line-through">{taka(product.mrp)}</span>}
      </div>
      {qtyInCart === 0 ? (
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
          className="mt-1 bg-teal-deep text-white text-sm font-semibold rounded-lg py-2 flex items-center justify-center gap-1.5 hover:bg-teal"
        >
          <Plus size={14} /> Add to cart
        </button>
      ) : (
        <div className="mt-1 flex items-center justify-between border border-teal-deep rounded-lg px-2 py-1.5">
          <button onClick={() => changeQty(product.id, -1)} className="text-teal-deep"><Minus size={14} /></button>
          <span className="text-sm font-semibold">{qtyInCart}</span>
          <button onClick={() => changeQty(product.id, 1)} className="text-teal-deep"><Plus size={14} /></button>
        </div>
      )}
    </div>
  );
}
