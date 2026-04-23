// Seeds the initial color palette. Run with: node scripts/seed-colors.mjs
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) });

const COLORS = [
  { name: "Violeta",       hex: "#7c3aed", sortOrder:  1 },
  { name: "Rosa",          hex: "#ec4899", sortOrder:  2 },
  { name: "Rojo",          hex: "#ef4444", sortOrder:  3 },
  { name: "Naranja neón",  hex: "#f97316", sortOrder:  4 },
  { name: "Amarillo",      hex: "#eab308", sortOrder:  5 },
  { name: "Verde neón",    hex: "#22d3ee", sortOrder:  6 },
  { name: "Azul",          hex: "#3b82f6", sortOrder:  7 },
  { name: "Negro",         hex: "#0a0a0a", sortOrder:  8 },
  { name: "Blanco",        hex: "#f5f5f5", sortOrder:  9 },
  { name: "Dorado",        hex: "#d4af37", sortOrder: 10 },
  { name: "Plateado",      hex: "#c0c0c0", sortOrder: 11 },
];

async function main() {
  for (const c of COLORS) {
    await prisma.color.upsert({
      where:  { name: c.name },
      update: { hex: c.hex, sortOrder: c.sortOrder },
      create: { name: c.name, hex: c.hex, sortOrder: c.sortOrder, isActive: true },
    });
    console.log(`✓ ${c.name.padEnd(16)} ${c.hex}`);
  }
  console.log(`\nSeeded ${COLORS.length} colors.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
