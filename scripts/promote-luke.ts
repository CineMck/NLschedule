import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    where: { email: "Luke@neuluma.com" },
    data: { role: "OWNER" },
  });

  if (result.count === 0) {
    // Try case-insensitive match
    const user = await prisma.user.findFirst({
      where: { email: { equals: "Luke@neuluma.com", mode: "insensitive" } },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "OWNER" },
      });
      console.log(`Promoted ${user.email} to OWNER`);
    } else {
      console.log("User Luke@neuluma.com not found");
    }
  } else {
    console.log(`Promoted Luke@neuluma.com to OWNER (${result.count} row(s) updated)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
