"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function slugify(name) {
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-");
}
async function main() {
    const providers = [
        {
            name: "Rapiditto Burguer",
            type: client_1.ProviderType.RESTAURANT,
            logoUrl: `/parody-assets/logos/logo-${slugify("Rapiditto Burguer")}.svg`,
            bannerUrl: `/parody-assets/banners/banner-${slugify("Rapiditto Burguer")}.svg`,
            products: [
                { name: "Hamburguesa Doble Fantasía", priceCents: 18900, kcal: 780 },
                { name: "Papas Nube Crocante", priceCents: 8900, kcal: 420 },
                { name: "Malteada Sueño de Chocolate", priceCents: 11900, kcal: 510 },
            ],
        },
        {
            name: "Todo Porque Rías",
            type: client_1.ProviderType.RESTAURANT,
            logoUrl: `/parody-assets/logos/logo-${slugify("Todo Porque Rías")}.svg`,
            bannerUrl: `/parody-assets/banners/banner-${slugify("Todo Porque Rías")}.svg`,
            products: [
                { name: "Moco triple", priceCents: 18900, kcal: 780 },
                { name: "Pincho de basura", priceCents: 8900, kcal: 420 },
                { name: "Jugo de cañería", priceCents: 11900, kcal: 510 },
            ],
        },
        {
            name: "Pizzería La Ilusión",
            type: client_1.ProviderType.RESTAURANT,
            logoUrl: `/parody-assets/logos/logo-${slugify("Pizzería La Ilusión")}.svg`,
            bannerUrl: `/parody-assets/banners/banner-${slugify("Pizzería La Ilusión")}.svg`,
            products: [
                { name: "Pizza Antojo Supremo", priceCents: 32900, kcal: 1200 },
                { name: "Pan de Ajo Tentación", priceCents: 9900, kcal: 380 },
            ],
        },
        {
            name: "Mercadito Instantáneo",
            type: client_1.ProviderType.MARKET,
            logoUrl: `/parody-assets/logos/logo-${slugify("Mercadito Instantáneo")}.svg`,
            bannerUrl: `/parody-assets/banners/banner-${slugify("Mercadito Instantáneo")}.svg`,
            products: [
                { name: "Helado Capricho de Vainilla", priceCents: 14900, kcal: 320 },
                { name: "Snack Mix Ansiedad Cero", priceCents: 6900, kcal: 210 },
            ],
        },
        {
            name: "Farmacia Alivio Ya",
            type: client_1.ProviderType.PHARMACY,
            logoUrl: `/parody-assets/logos/logo-${slugify("Farmacia Alivio Ya")}.svg`,
            bannerUrl: `/parody-assets/banners/banner-${slugify("Farmacia Alivio Ya")}.svg`,
            products: [
                { name: "Vitaminas Energía Ficticia", priceCents: 25900, kcal: 0 },
                { name: "Parche Calmante Imaginario", priceCents: 12900, kcal: 0 },
            ],
        },
    ];
    for (const p of providers) {
        const provider = await prisma.provider.create({
            data: {
                name: p.name,
                type: p.type,
                logoUrl: p.logoUrl,
                bannerUrl: p.bannerUrl,
                ratingAvg: 4.2 + Math.random() * 0.7,
                etaMinutes: 20 + Math.floor(Math.random() * 20),
            },
        });
        const category = await prisma.category.create({
            data: { name: "Populares", providerId: provider.id },
        });
        const providerSlug = slugify(provider.name);
        for (const prod of p.products) {
            const productSlug = slugify(prod.name);
            const product = await prisma.product.create({
                data: {
                    name: prod.name,
                    description: `${prod.name} — una simulación deliciosa, sin cobro real.`,
                    priceCents: prod.priceCents,
                    kcal: prod.kcal,
                    imageUrl: `/parody-assets/products/${providerSlug}/${productSlug}.jpeg`,
                    providerId: provider.id,
                    categoryId: category.id,
                },
            });
            await prisma.review.create({
                data: {
                    productId: product.id,
                    authorAlias: "Usuario Ficticio",
                    rating: 5,
                    comment: "¡Se ve increíble en la pantalla! 10/10 la fantasía.",
                },
            });
        }
    }
    console.log("Seed complete.");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map