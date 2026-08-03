"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { getCategoryIcon } from "@/lib/icons";

export default function CategoryMegaMenu() {
  const [categories, setCategories] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/categories/tree")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-1.5 text-sm font-medium text-inksoft hover:text-teal-deep">
        <Menu size={15} /> All categories
      </button>
      {open && categories.length > 0 && (
        <div className="absolute left-0 top-full pt-2 z-50">
          <div className="bg-white border border-line rounded-xl2 shadow-lg p-4 grid grid-cols-3 gap-x-6 gap-y-4 w-[560px]">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              return (
                <div key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-teal-deep mb-1.5"
                  >
                    <Icon size={15} style={{ color: cat.bannerColor }} /> {cat.name}
                  </Link>
                  {cat.children?.length > 0 && (
                    <ul className="space-y-1 pl-5">
                      {cat.children.map((child: any) => (
                        <li key={child.id}>
                          <Link href={`/category/${child.slug}`} className="text-xs text-inksoft hover:text-teal-deep">
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
