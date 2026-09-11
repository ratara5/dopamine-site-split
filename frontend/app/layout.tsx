import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header"
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Rhappy — Simulación de pedidos",
  description:
    "Sitio de simulación/parodia. No se realizan cobros ni entregas reales.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("font-sans", inter.variable)}>
      <body>
        <Header />
        <Providers>
          <main>{children}</main>
          <footer className="mt-12 border-t border-neutral-200 p-4 text-center text-xs text-neutral-500">
            Este es un sitio de simulación con fines de entretenimiento y
            bienestar. No se realizan cobros ni entregas reales. No afiliado
            con marcas reales.
          </footer>
        </Providers>
      </body>
    </html>
  );
}