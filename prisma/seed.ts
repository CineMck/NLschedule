import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "Demo Business",
      timezone: "America/New_York",
      weekStartsOn: 0,
    },
  });

  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: "owner@demo.com",
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      email: "owner@demo.com",
      passwordHash,
      name: "Demo Owner",
      role: "OWNER",
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: "manager@demo.com",
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      email: "manager@demo.com",
      passwordHash,
      name: "Demo Manager",
      role: "MANAGER",
      organizationId: org.id,
    },
  });

  await prisma.user.upsert({
    where: {
      email_organizationId: {
        email: "employee@demo.com",
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      email: "employee@demo.com",
      passwordHash,
      name: "Demo Employee",
      role: "EMPLOYEE",
      payType: "HOURLY",
      hourlyRate: 15.0,
      organizationId: org.id,
    },
  });

  console.log("Seed data created successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
