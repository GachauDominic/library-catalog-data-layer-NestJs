import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "../generated/prisma/client.js";
import * as bcrypt from "bcrypt";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL must be set before seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const catalog = {
  Fiction: [
    ["Pride and Prejudice", "Jane Austen", "A comedy of manners and misunderstandings."],
    ["Jane Eyre", "Charlotte Brontë", "A novel of independence, love, and belonging."],
    ["The Great Gatsby", "F. Scott Fitzgerald", "A portrait of ambition in the Jazz Age."],
    ["Things Fall Apart", "Chinua Achebe", "A community faces profound change."],
  ],
  Science: [
    ["A Brief History of Time", "Stephen Hawking", "An introduction to cosmology and the universe."],
    ["The Selfish Gene", "Richard Dawkins", "An influential account of evolution from the gene's perspective."],
    ["Cosmos", "Carl Sagan", "A tour of the universe and humanity's place in it."],
    ["Silent Spring", "Rachel Carson", "A landmark work on pesticides and the natural world."],
  ],
  History: [
    ["The River Between", "Ngũgĩ wa Thiong'o", "A story of tradition and change in colonial Kenya."],
    ["The Wretched of the Earth", "Frantz Fanon", "An analysis of colonialism and its effects."],
    ["Long Walk to Freedom", "Nelson Mandela", "The autobiography of South Africa's first democratically elected president."],
    ["The Making of the African Working Class", "Frederick Cooper", "A study of labour and political change in colonial Africa."],
  ],
  Technology: [
    ["The Pragmatic Programmer", "David Thomas and Andrew Hunt", "Practical habits for effective software development."],
    ["Clean Code", "Robert C. Martin", "Principles and examples for writing maintainable code."],
    ["Designing Data-Intensive Applications", "Martin Kleppmann", "Foundations for reliable and scalable data systems."],
    ["Code", "Charles Petzold", "How computers represent and process information."],
  ],
} as const;

async function main() {
  for (const [genreName, books] of Object.entries(catalog)) {
    const genre = await prisma.genre.upsert({
      where: { name: genreName },
      update: {},
      create: { name: genreName },
    });

    for (const [index, [title, author, description]] of books.entries()) {
      const isbn = `978000000${String(Object.keys(catalog).indexOf(genreName) * 4 + index + 1).padStart(4, "0")}`;
      await prisma.book.upsert({
        where: { isbn },
        update: { title, author, description, genreId: genre.id, totalCopies: 1 },
        create: { isbn, title, author, description, genreId: genre.id, totalCopies: 1 },
      });
    }
  }

  const librarianEmail = process.env.SEED_LIBRARIAN_EMAIL?.trim().toLowerCase();
  const librarianPassword = process.env.SEED_LIBRARIAN_PASSWORD;
  if (Boolean(librarianEmail) !== Boolean(librarianPassword)) {
    throw new Error(
      "Set both SEED_LIBRARIAN_EMAIL and SEED_LIBRARIAN_PASSWORD, or leave both blank.",
    );
  }
  if (librarianEmail && librarianPassword) {
    if (Buffer.byteLength(librarianPassword, "utf8") < 12 || Buffer.byteLength(librarianPassword, "utf8") > 72) {
      throw new Error("SEED_LIBRARIAN_PASSWORD must be 12–72 UTF-8 bytes.");
    }
    const passwordHash = await bcrypt.hash(librarianPassword, 12);
    await prisma.user.upsert({
      where: { email: librarianEmail },
      update: { name: "Catalog Librarian", passwordHash, role: Role.LIBRARIAN },
      create: {
        email: librarianEmail,
        name: "Catalog Librarian",
        passwordHash,
        role: Role.LIBRARIAN,
      },
    });
    console.log(`Seeded librarian account ${librarianEmail}.`);
  }

  console.log("Seeded 4 genres and 16 books.");
}

main()
  .catch((error: unknown) => {
    console.error("Catalog seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
