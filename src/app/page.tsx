import Link from "next/link";
import { Upload } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { getCategoryIcon } from "@/lib/icons";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.category.findMany({
      include: { children: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main>
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center px-6 py-14">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-teal flex items-center gap-2 mb-3.5">
            <span className="w-4 h-0.5 bg-marigold inline-block" /> Online pharmacy · Dhaka &amp; beyond
          </div>
          <h1 className="font-display font-semibold text-[38px] leading-tight mb-4">
            Your neighborhood <em className="italic text-teal-deep">pharmacy</em>,<br />now on your phone.
          </h1>
          <p className="text-inksoft max-w-md mb-6">
            Genuine medicine, licensed pharmacists, and doorstep delivery in under 90 minutes.
            Upload a prescription or search by symptom to get started.
          </p>
          <div className="flex gap-3 max-w-md mb-8">
            <Link
              href="/products"
              className="flex-1 border border-line rounded-lg px-4 py-3 text-sm text-inksoft"
            >
              Browse all products
            </Link>
            <Link
              href="/account/prescriptions"
              className="bg-marigold text-[#3A2409] rounded-lg px-5 py-3 text-sm font-semibold flex items-center gap-2"
            >
              <Upload size={16} /> Upload Rx
            </Link>
          </div>
          <div className="flex gap-7 flex-wrap">
            <div><strong className="font-display block text-xl text-teal-deep">12,000+</strong><span className="text-xs text-inksoft">Products listed</span></div>
            <div><strong className="font-display block text-xl text-teal-deep">64</strong><span className="text-xs text-inksoft">Cities delivered to</span></div>
            <div><strong className="font-display block text-xl text-teal-deep">90 min</strong><span className="text-xs text-inksoft">Avg. delivery time</span></div>
          </div>
        </div>
        <div className="bg-white border border-line rounded-2xl p-6 grid grid-cols-5 gap-3 -rotate-2">
          {["filled","filled","pop","filled","accent","pop","filled","filled","pop","accent","filled","pop","filled","accent","filled"].map((t, i) => (
            <div
              key={i}
              className={`aspect-square rounded-full ${
                t === "filled" ? "bg-teal-light border border-teal" :
                t === "accent" ? "bg-[#FBEEDD] border border-marigold" :
                "border border-dashed border-line"
              }`}
            />
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-14">
        <h2 className="text-2xl font-semibold mb-5">All you need</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const color = cat.bannerColor ?? "#0C5C4C";
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-2 text-center group"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:-translate-y-0.5"
                  style={{ background: color }}
                >
                  <Icon size={24} color="#fff" strokeWidth={1.6} />
                </div>
                <span className="text-xs font-medium text-inksoft">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Popular right now</h2>
          <Link href="/products" className="text-sm font-medium text-teal-deep">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </main>
  );
}
