import "dotenv/config";
import prisma from "./db/prisma.js";
import bcrypt from "bcryptjs";

const PASSWORD = "Password1!";

const clients = [
  { firstName: "Alice", lastName: "Martin", email: "alice.martin@demo.com" },
  { firstName: "Youssef", lastName: "Benali", email: "youssef.benali@demo.com" },
  { firstName: "Sofia", lastName: "Dupont", email: "sofia.dupont@demo.com" },
  { firstName: "Karim", lastName: "Idrissi", email: "karim.idrissi@demo.com" },
  { firstName: "Laura", lastName: "Fontaine", email: "laura.fontaine@demo.com" },
];

const employees = [
  { firstName: "Mehdi", lastName: "Zaki", email: "mehdi.zaki@agence47.ma" },
  { firstName: "Nadia", lastName: "Chraibi", email: "nadia.chraibi@agence47.ma" },
  { firstName: "Amine", lastName: "Tazi", email: "amine.tazi@agence47.ma" },
];

async function main() {
  const hashed = await bcrypt.hash(PASSWORD, 10);

  console.log("🌱 Seeding users...");

  for (const client of clients) {
    await prisma.user.upsert({
      where: { email: client.email },
      update: {},
      create: { ...client, password: hashed, role: "CLIENT", provider: "LOCAL" },
    });
    console.log(`✅ Client: ${client.email}`);
  }

  for (const emp of employees) {
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: { ...emp, password: hashed, role: "EMPLOYEE", provider: "LOCAL" },
    });
    console.log(`✅ Employee: ${emp.email}`);
  }

  console.log("\n✅ Done! All users created with password: " + PASSWORD);
  console.log("\nClients:");
  clients.forEach(c => console.log(`  ${c.email}  /  ${PASSWORD}`));
  console.log("\nEmployees:");
  employees.forEach(e => console.log(`  ${e.email}  /  ${PASSWORD}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
