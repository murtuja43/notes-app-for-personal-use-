import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seeds a demo user with a couple of notes so you can log in immediately.
 *
 *   Email:    demo@example.com
 *   Password: password123
 */
async function main() {
  const email = "demo@example.com";
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "Demo User",
      email,
      password,
      notes: {
        create: [
          {
            title: "Welcome to NoteAll",
            content:
              "This is your first note. Edit me, or create a new note from the dashboard.",
            isPinned: true,
            sortOrder: 0,
          },
          {
            title: "Shopping list",
            content: "Milk\nEggs\nCoffee\nBread",
            isPinned: false,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log(`Seeded demo user: ${user.email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
