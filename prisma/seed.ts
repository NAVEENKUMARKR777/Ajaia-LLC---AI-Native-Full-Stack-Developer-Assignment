import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function doc(content: any) {
  return JSON.stringify(content);
}

async function main() {
  await prisma.share.deleteMany();
  await prisma.document.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: { name: "Alice", email: "alice@example.com" },
  });
  const bob = await prisma.user.create({
    data: { name: "Bob", email: "bob@example.com" },
  });
  const carol = await prisma.user.create({
    data: { name: "Carol", email: "carol@example.com" },
  });

  const welcomeDoc = await prisma.document.create({
    data: {
      title: "Welcome to DocFlow",
      ownerId: alice.id,
      content: doc({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Welcome to DocFlow" }],
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "This is a " },
              { type: "text", marks: [{ type: "bold" }], text: "shared" },
              {
                type: "text",
                text: " document. Alice owns it and shared it with Bob.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Try it out" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Edit this text and watch it autosave" },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        marks: [{ type: "italic" }],
                        text: "Use the toolbar for formatting",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
    },
  });

  await prisma.share.create({
    data: { documentId: welcomeDoc.id, userId: bob.id },
  });

  await prisma.document.create({
    data: {
      title: "Alice's Private Notes",
      ownerId: alice.id,
      content: doc({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "These notes are private to Alice." },
            ],
          },
        ],
      }),
    },
  });

  await prisma.document.create({
    data: {
      title: "Bob's Project Plan",
      ownerId: bob.id,
      content: doc({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Project Plan" }],
          },
          {
            type: "orderedList",
            content: [
              {
                type: "listItem",
                content: [
                  { type: "paragraph", content: [{ type: "text", text: "Kickoff" }] },
                ],
              },
              {
                type: "listItem",
                content: [
                  { type: "paragraph", content: [{ type: "text", text: "Build" }] },
                ],
              },
              {
                type: "listItem",
                content: [
                  { type: "paragraph", content: [{ type: "text", text: "Ship" }] },
                ],
              },
            ],
          },
        ],
      }),
    },
  });

  console.log("Seeded users:", { alice: alice.email, bob: bob.email, carol: carol.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
