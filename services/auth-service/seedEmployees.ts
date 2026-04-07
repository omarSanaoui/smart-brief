import "dotenv/config";
import prisma from "./db/prisma.js";
import bcrypt from "bcryptjs";

const employees = [
  {
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@smartbrief.com",
    role: "EMPLOYEE",
    password: "Password123!"
  },
  {
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@smartbrief.com",
    role: "EMPLOYEE",
    password: "Password123!"
  },
  {
    firstName: "Charlie",
    lastName: "Davis",
    email: "charlie@smartbrief.com",
    role: "EMPLOYEE",
    password: "Password123!"
  },
  {
    firstName: "Diana",
    lastName: "Prince",
    email: "diana@smartbrief.com",
    role: "EMPLOYEE",
    password: "Password123!"
  }
];

async function seed() {
  console.log("🌱 Seeding employees...");
  
  for (const emp of employees) {
    const { password, ...userData } = emp;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        ...userData,
        password: hashedPassword,
        provider: "LOCAL",
        role: emp.role as any
      }
    });
    console.log(`✅ Created/Checked employee: ${emp.email}`);
  }
  
  console.log("✨ Seeding completed!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
