// components/ProductCard.tsx
import Image from "next/image";

type ProductCardProps = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string;
};

export function ProductCard({ name, priceCents, imageUrl }: ProductCardProps) {
  return (
      <div className="flex flex-col items-center gap-2 aspect-square rounded-md bg-brand-light">
        <div className="mb-2 aspect-video rounded-lg bg-brand-light" />
        <p className="font-medium">{name}</p>
        <Image
            src={imageUrl}
            alt={name}
            width={512}
            height={512}
            className="rounded-md object-cover p-1"
        />    
        <p className="mb-2 text-sm text-neutral-500">
            ${(priceCents).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
        </p>
      </div>
  );
}