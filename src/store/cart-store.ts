import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartProduct = {
  id: string;
  name: string;
  sub: string;
  price: number;
  mrp: number;
  requiresPrescription: boolean;
};

type CartLine = { product: CartProduct; qty: number };

type CartState = {
  lines: Record<string, CartLine>;
  addItem: (product: CartProduct) => void;
  changeQty: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: {},
      addItem: (product) =>
        set((state) => {
          const existing = state.lines[product.id];
          return {
            lines: {
              ...state.lines,
              [product.id]: { product, qty: (existing?.qty ?? 0) + 1 },
            },
          };
        }),
      changeQty: (productId, delta) =>
        set((state) => {
          const existing = state.lines[productId];
          if (!existing) return state;
          const nextQty = existing.qty + delta;
          const next = { ...state.lines };
          if (nextQty <= 0) delete next[productId];
          else next[productId] = { ...existing, qty: nextQty };
          return { lines: next };
        }),
      removeItem: (productId) =>
        set((state) => {
          const next = { ...state.lines };
          delete next[productId];
          return { lines: next };
        }),
      clear: () => set({ lines: {} }),
    }),
    { name: "nirog-cart" }
  )
);
