// Home feed: lists parody providers pulled from the backend's
// GET /v1/providers. Server component — fetches at request time,
// same as the original's direct-Prisma request-time query (no
// caching), just one HTTP hop further now that the DB lives behind
// the backend API instead of in-process.
import Link from "next/link";
import { ProviderCard } from "@/components/ProviderCard";
import { apiUrl } from "@/lib/api";

type Provider = {
  id: string;
  name: string;
  type: string;
  logoUrl: string;
  ratingAvg: number;
  etaMinutes: number;
};

export default async function HomePage() {
  const res = await fetch(apiUrl("/v1/providers"), { cache: "no-store" });
  const { providers }: { providers: Provider[] } = await res.json();

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-6 text-2xl font-bold text-brand-dark">
        ¿Qué antojo simulamos hoy?
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {providers.map((provider) => (
          <Link
            key={provider.id}
            href={`/providers/${provider.id}`}
            className="rounded-xl border border-neutral-200 p-3 shadow-sm transition hover:shadow-md"
          >
            <ProviderCard
              id={provider.id}
              name={provider.name}
              type={provider.type as any}
              ratingAvg={provider.ratingAvg}
              etaMinutes={provider.etaMinutes}
              logoUrl={provider.logoUrl}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
