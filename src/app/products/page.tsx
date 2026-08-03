import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const category = searchParams.category;
  const q = searchParams.q ?? "";

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(category ? { category: { slug: category } } : {}),
      ...(q
        ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sub: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{q ? `Results for "${q}"` : "All products"}</h1>
        <p className="text-sm text-inksoft mt-1">
          {products.length} product{products.length !== 1 ? "s" : ""} found ·{" "}
          <Link href="/" className="text-teal-deep font-medium">Browse by category instead</Link>
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-inksoft">No products match your search.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map((p: { id: string }) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
