import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) return notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Edit product</h1>
      <ProductForm
        productId={product.id}
        initial={{
          name: product.name,
          slug: product.slug,
          sub: product.sub,
          description: product.description,
          price: product.price,
          mrp: product.mrp,
          stock: product.stock,
          categoryId: product.categoryId,
          requiresPrescription: product.requiresPrescription,
        }}
      />
    </div>
  );
}
