import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getCategoryIcon } from "@/lib/icons";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { children: true, parent: { include: { children: true } } },
  });

  if (!category) return notFound();

  // If this is a subcategory, show it in the context of its parent's other subcategories.
  const siblingNav = category.parent ? category.parent.children : category.children;
  const isSubcategory = Boolean(category.parent);

  // Products belonging directly to this category, plus (for a parent category
  // with no products of its own) products from all of its subcategories.
  const categoryIds = category.children.length > 0
    ? [category.id, ...category.children.map((c: { id: string }) => c.id)]
    : [category.id];

  const products = await prisma.product.findMany({
    where: { active: true, categoryId: { in: categoryIds } },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const Icon = getCategoryIcon(category.icon);
  const color = category.bannerColor ?? "#0C5C4C";

  return (
    <main>
      <section
        className="px-6 py-10"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)` }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
            <Icon size={30} color="#fff" strokeWidth={1.6} />
          </div>
          <div>
            {category.parent && (
              <Link href={`/category/${category.parent.slug}`} className="text-xs text-white/80 hover:underline">
                {category.parent.name}
              </Link>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-white">{category.name}</h1>
            {category.description && <p className="text-white/85 text-sm mt-1 max-w-xl">{category.description}</p>}
          </div>
        </div>
      </section>

      {siblingNav.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pt-6 flex gap-2 flex-wrap">
          {!isSubcategory && (
            <Link
              href={`/category/${category.slug}`}
              className="px-3.5 py-1.5 rounded-full text-sm font-medium bg-teal-deep text-white"
            >
              All {category.name}
            </Link>
          )}
          {siblingNav.map((c: { id: string; slug: string; name: string }) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${
                c.slug === category.slug ? "bg-teal-deep border-teal-deep text-white" : "border-line text-inksoft bg-mint"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      <section className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-sm text-inksoft mb-5">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        {products.length === 0 ? (
          <div className="text-center py-16 text-inksoft">No products in this category yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map((p: { id: string }) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
