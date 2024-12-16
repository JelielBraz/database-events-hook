import prisma from "./prisma";

async function generateAddressEvents() {
  const address = await prisma.address.create({
    data: {
      street: "123 Main St",
      city: "Springfield",
    },
  });

  await prisma.address.update({
    data: {
      street: "456 Elm St",
    },
    where: {
      id: address.id,
    },
  });

  await prisma.address.delete({
    where: {
      id: address.id,
    },
  });
}

async function generateCustomerEvents() {
  const customer = await prisma.customer.create({
    data: {
      name: "John Doe",
      email: `john.doe@example${Math.floor(Math.random() * 500)}.com`,
    },
  });

  await prisma.customer.update({
    data: {
      name: "Jane Doe",
    },
    where: {
      id: customer.id,
    },
  });

  await prisma.customer.delete({
    where: {
      id: customer.id,
    },
  });
}

async function main() {
  await generateAddressEvents();
  await generateCustomerEvents();
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
