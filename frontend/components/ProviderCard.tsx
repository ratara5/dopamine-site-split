// components/ProviderCard.tsx
import Image from "next/image";

export enum ProviderType {
  RESTAURANT,
  MARKET,
  PHARMACY,
  LIQUOR
}

type ProviderCardProps = {
  id: string;
  name: string;
  type: ProviderType;
  ratingAvg: number;
  etaMinutes: number;
  logoUrl: string;
};

export function ProviderCard({ name, type, ratingAvg, etaMinutes, logoUrl }: ProviderCardProps) {
  return (
      <div className="flex flex-col items-center gap-2 aspect-square rounded-md bg-brand-light">
        <div className="mb-2 aspect-video rounded-lg bg-brand-light" />
        <p className="font-semibold">{name}</p>
        <Image
            width={128}
            height={128}
            src={logoUrl}
            alt={name}
            className="mb-2 h-28 w-28 rounded-full object-cover"
        />
          <p className="text-xs text-neutral-500">{type}</p>
          <p className=" mb-2 text-sm text-neutral-500">
              ⭐ {ratingAvg.toFixed(1)} · {etaMinutes} min
          </p>
      </div>
  );
}