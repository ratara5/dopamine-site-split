// components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import { CartDrawer } from "@/components/CartDrawer";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 p-4">
      <Link href="/">
        <div className="flex items-center">
        <Image src="/parody-assets/rhappy/icon.svg" alt="Rhappy Logo" width={40} height={40} />
        <p className="text-lg font-bold text-brand-dark">Rhappy</p>
        </div>
      </Link>
      <CartDrawer />
    </header>
  );
}