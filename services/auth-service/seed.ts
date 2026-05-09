import "dotenv/config";
import prisma from "./db/prisma.js";
import bcrypt from "bcryptjs";

const PASSWORD = "Password1!";

const admins = [
  { firstName: "Omar", lastName: "Sanaoui", email: "omar.sanaoui@agence47.ma" },
  { firstName: "Sara", lastName: "Moussaoui", email: "sara.moussaoui@agence47.ma" },
];

const clients = [
  { firstName: "Alice", lastName: "Martin", email: "alice.martin@demo.com" },
  { firstName: "Youssef", lastName: "Benali", email: "youssef.benali@demo.com" },
  { firstName: "Sofia", lastName: "Dupont", email: "sofia.dupont@demo.com" },
  { firstName: "Karim", lastName: "Idrissi", email: "karim.idrissi@demo.com" },
  { firstName: "Laura", lastName: "Fontaine", email: "laura.fontaine@demo.com" },
  { firstName: "Hamza", lastName: "El Amrani", email: "hamza.elamrani@demo.com" },
  { firstName: "Camille", lastName: "Bernard", email: "camille.bernard@demo.com" },
];

const employees = [
  { firstName: "Mehdi", lastName: "Zaki", email: "mehdi.zaki@agence47.ma" },
  { firstName: "Nadia", lastName: "Chraibi", email: "nadia.chraibi@agence47.ma" },
  { firstName: "Amine", lastName: "Tazi", email: "amine.tazi@agence47.ma" },
  { firstName: "Zineb", lastName: "Fassi", email: "zineb.fassi@agence47.ma" },
];

async function main() {
  const hashed = await bcrypt.hash(PASSWORD, 10);

  console.log("🌱 Seeding users...");

  for (const admin of admins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {},
      create: { ...admin, password: hashed, role: "ADMIN", provider: "LOCAL" },
    });
    console.log(`✅ Admin: ${admin.email}`);
  }

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
  console.log("\nAdmins:");
  admins.forEach(a => console.log(`  ${a.email}  /  ${PASSWORD}`));
  console.log("\nClients:");
  clients.forEach(c => console.log(`  ${c.email}  /  ${PASSWORD}`));
  console.log("\nEmployees:");
  employees.forEach(e => console.log(`  ${e.email}  /  ${PASSWORD}`));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
