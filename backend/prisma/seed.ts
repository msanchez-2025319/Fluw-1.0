import "dotenv/config";
import { PrismaClient, Role } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const userPassword = await bcrypt.hash("User123!", 10);

  await prisma.user.upsert({
    where: { email: "admin@flow.com" },
    update: {},
    create: {
      email: "admin@flow.com",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@flow.com" },
    update: {},
    create: {
      email: "user@flow.com",
      password: userPassword,
      role: Role.USER,
    },
  });

  console.log("Usuarios de prueba creados:");
  console.log("ADMIN -> admin@flow.com / Admin123!");
  console.log("USER  -> user@flow.com / User123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });