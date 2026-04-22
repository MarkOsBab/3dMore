import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const zones = [
  { name: "Centro", cost: 150, sortOrder: 1 },
  { name: "Cordón", cost: 150, sortOrder: 2 },
  { name: "Pocitos", cost: 180, sortOrder: 3 },
  { name: "Punta Carretas", cost: 180, sortOrder: 4 },
  { name: "Buceo", cost: 200, sortOrder: 5 },
  { name: "Parque Batlle", cost: 180, sortOrder: 6 },
  { name: "Tres Cruces", cost: 170, sortOrder: 7 },
  { name: "Aguada", cost: 170, sortOrder: 8 },
  { name: "Ciudad Vieja", cost: 180, sortOrder: 9 },
  { name: "Malvín", cost: 220, sortOrder: 10 },
  { name: "Carrasco", cost: 280, sortOrder: 11 },
  { name: "Prado", cost: 220, sortOrder: 12 },
  { name: "Unión", cost: 200, sortOrder: 13 },
  { name: "Cerrito", cost: 220, sortOrder: 14 },
  { name: "Belvedere", cost: 220, sortOrder: 15 },
  { name: "Paso Molino", cost: 220, sortOrder: 16 },
];

for (const z of zones) {
  await prisma.shippingZone.upsert({
    where: { name: z.name },
    update: {},
    create: z,
  });
}

console.log(`Seed completo: ${zones.length} zonas`);
await prisma.$disconnect();
