import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const newPassword = "admin@123";

  // Find the super admin user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error("Super admin user not found");
    process.exit(1);
  }

  // Hash the new password
  const hashedPassword = await hash(newPassword, 12);

  // Update the password
  const updatedUser = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log("Super admin password updated successfully");
  console.log("Email:", updatedUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 