// Now fetches from the backend's GET /v1/products/:id instead of
// querying Prisma directly. NOTE: that endpoint caps reviews at the
// latest 20 (ordered newest-first) — the original monolith's version
// of this page fetched ALL reviews unbounded via direct Prisma access.
// See MIGRATION_NOTES.md for why this cap was kept rather than widened.
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/AddToCartButton";
import { apiUrl } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  providerId: string;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(apiUrl(`/v1/products/${id}`), { cache: "no-store" });
  if (res.status === 404) notFound();
  const { product }: { product: Product } = await res.json();

  return (
    <div className="mx-auto max-w-2xl p-4">
      <Image
        src={product.imageUrl}
        alt={product.name}
        width={800}
        height={800}
        className="mb-4 rounded-md"
      />
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-neutral-600">{product.description}</p>
      <p className="mt-2 text-lg font-semibold">
        ${(product.priceCents).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
      </p>
      <AddToCartButton
        providerId={product.providerId}
        productId={product.id}
        name={product.name}
        priceCents={product.priceCents} />
    </div>
  );
}
