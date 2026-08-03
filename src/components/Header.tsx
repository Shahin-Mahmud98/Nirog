"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingCart, User, Pill } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cart-store";
import CategoryMegaMenu from "@/components/CategoryMegaMenu";

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const cartCount = useCartStore((s) =>
    Object.values(s.lines).reduce((sum, l) => sum + l.qty, 0)
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/products?q=${encodeURIComponent(query)}`);
  }

  return (
    <>
      <div className="bg-teal-deep text-white text-xs px-6 py-1.5 flex justify-between">
        <span className="opacity-90">Free delivery on orders over ৳500 in Dhaka</span>
        <span className="opacity-90 hidden sm:inline">Licensed pharmacy · DGDA registered</span>
      </div>
      <header className="bg-white border-b border-line px-6 py-3.5 flex items-center gap-5 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-md bg-teal-deep flex items-center justify-center">
            <Pill size={16} color="#fff" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-display italic font-semibold text-xl text-teal-deep leading-none">Nirog</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-inksoft">
          <CategoryMegaMenu />
          <Link href="/category/medicine" className="hover:text-teal-deep">Medicine</Link>
          <Link href="/category/beauty" className="hover:text-teal-deep">Beauty</Link>
          <Link href="/category/healthcare" className="hover:text-teal-deep">Healthcare</Link>
          <Link href="/account/prescriptions" className="hover:text-teal-deep">Upload Prescription</Link>
        </nav>

        <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-inksoft" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine, brand, or symptom"
            className="w-full pl-9 pr-3 py-2 rounded-full border border-line bg-mint text-sm outline-none focus:border-teal"
          />
        </form>

        <div className="flex items-center gap-3 shrink-0">
          {session?.user ? (
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-sm font-medium">
                <User size={19} />
                <span className="hidden sm:inline">{session.user.name?.split(" ")[0]}</span>
              </button>
              <div className="absolute right-0 top-full pt-2 hidden group-hover:block">
                <div className="bg-white border border-line rounded-lg shadow-md w-44 py-1 text-sm">
                  <Link href="/orders" className="block px-3 py-2 hover:bg-mint">My orders</Link>
                  <Link href="/account/prescriptions" className="block px-3 py-2 hover:bg-mint">Prescriptions</Link>
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin" className="block px-3 py-2 hover:bg-mint">Admin panel</Link>
                  )}
                  <button onClick={() => signOut()} className="w-full text-left px-3 py-2 hover:bg-mint text-redx">
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium">Sign in</Link>
          )}
          <Link href="/cart" className="relative p-1.5">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-marigold text-[10px] font-bold text-[#3A2409] rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>
    </>
  );
}
