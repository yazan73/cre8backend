import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      id: 'seed-tee',
      type: ProductType.t_shirt,
      basePrice: 29.99,
      frontImageUrl: 'https://iili.io/fVy661S.jpg',
      backImageUrl: 'https://iili.io/fVy6s29.jpg',
    },
    {
      id: 'seed-hoodie',
      type: ProductType.hoodie,
      basePrice: 49.99,
      frontImageUrl: 'https://iili.io/fVy661S.jpg',
      backImageUrl: 'https://iili.io/fVy6s29.jpg',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        type: product.type,
        basePrice: product.basePrice,
        frontImageUrl: product.frontImageUrl,
        backImageUrl: product.backImageUrl,
      },
      create: product,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
