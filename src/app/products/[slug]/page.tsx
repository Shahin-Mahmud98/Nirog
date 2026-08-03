import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartPanel from "@/components/AddToCartPanel";
import { getCategoryIcon } from "@/lib/icons";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) return notFound();

  const discount = Math.round((1 - product.price / product.mrp) * 100);
  const color = product.category.bannerColor ?? "#0C5C4C";
  const Icon = getCategoryIcon(product.category.icon);

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
      <div className="rounded-2xl flex items-center justify-center py-16" style={{ background: color + "1A" }}>
        <div className="w-28 h-28 rounded-full flex items-center justify-center" style={{ background: color }}>
          <Icon size={52} color="#fff" strokeWidth={1.4} />
        </div>
      </div>
      <div>
        <Link href={`/category/${product.category.slug}`} className="text-xs font-semibold uppercase tracking-wide text-teal hover:underline">
          {product.category.name}
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{product.name}</h1>
        <p className="text-inksoft text-sm mt-1">{product.sub}</p>

        {product.requiresPrescription && (
          <div className="mt-4 bg-[#FBEEDD] border border-marigold text-[#7A4D0E] text-sm rounded-lg px-3.5 py-2.5">
            This item requires a valid prescription. Upload one at checkout.
          </div>
        )}

        <div className="flex items-baseline gap-3 mt-5">
          <span className="font-mono font-semibold text-2xl text-teal-deep">৳{product.price}</span>
          {discount > 0 && <span className="font-mono text-sm text-inksoft line-through">৳{product.mrp}</span>}
          {discount > 0 && <span className="text-xs font-bold text-redx">-{discount}%</span>}
        </div>

        <p className="text-sm text-inksoft mt-5 leading-relaxed">{product.description}</p>

        <AddToCartPanel product={product} />

        <div className="mt-8 text-xs text-inksoft space-y-1">
          <p>{product.stock > 0 ? `In stock (${product.stock} available)` : "Out of stock"}</p>
          <p>Delivered from a DGDA-licensed pharmacy.</p>
        </div>
      </div>
    </main>
  );
}
