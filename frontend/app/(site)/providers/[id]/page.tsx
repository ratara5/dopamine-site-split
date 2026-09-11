// Provider page: shows categories/products, lets the user add fake
// items to the cart. Now fetches from the backend's
// GET /v1/providers/:id instead of querying Prisma directly.
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { AddToCartButton } from "@/components/AddToCartButton";
import { apiUrl } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string;
};

type Category = { id: string; name: string; products: Product[] };

type Provider = {
  id: string;
  name: string;
  bannerUrl: string;
  ratingAvg: number;
  etaMinutes: number;
  categories: Category[];
};

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(apiUrl(`/v1/providers/${id}`), {
    cache: "no-store",
  });
  if (res.status === 404) notFound();
  const { provider }: { provider: Provider } = await res.json();

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-4 aspect-[3/1] rounded-xl bg-brand-light">
        <Image
          src={provider.bannerUrl}
          alt={`${provider.name} banner`}
          width={1200}
          height={400}
          className="h-full w-full rounded-xl object-cover"
        />
      </div>
      <h1 className="text-2xl font-bold">{provider.name}</h1>
      <p className="mb-6 text-sm text-neutral-500">
        ⭐ {provider.ratingAvg.toFixed(1)} · {provider.etaMinutes} min
        (simulado)
      </p>

      {provider.categories.map((category) => (
        <div key={category.id} className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">{category.name}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {category.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="rounded-xl border border-neutral-200 p-3 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-2">
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    priceCents={product.priceCents}
                    imageUrl={product.imageUrl}
                  />
                  <AddToCartButton
                    providerId={provider.id}
                    productId={product.id}
                    name={product.name}
                    priceCents={product.priceCents}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
