import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create client user
  const clientPassword = await hash("client123", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: {},
    create: {
      email: "client@example.com",
      name: "Client User",
      password: clientPassword,
      role: "CLIENT",
    },
  });

  // Create team member user
  const teamMemberPassword = await hash("team123", 12);
  const teamMember = await prisma.user.upsert({
    where: { email: "team@example.com" },
    update: {},
    create: {
      email: "team@example.com",
      name: "Team Member",
      password: teamMemberPassword,
      role: "TEAM_MEMBER",
    },
  });

  // Create a sample survey
  const survey = await prisma.survey.create({
    data: {
      title: "Monthly Performance Review - March 2024",
      description: "Please provide feedback for your team member's performance in March 2024.",
      frequency: "MONTHLY",
      triggerDate: 25,
      status: "PENDING",
      clientId: client.id,
      teamMemberId: teamMember.id,
      questions: {
        create: [
          {
            text: "How satisfied are you with the team member's performance this month?",
            type: "RATING",
            required: true,
            order: 0,
          },
          {
            text: "What went well?",
            type: "TEXT",
            required: true,
            order: 1,
          },
          {
            text: "What could be improved?",
            type: "TEXT",
            required: true,
            order: 2,
          },
          {
            text: "Would you like to continue working with this team member?",
            type: "BOOLEAN",
            required: true,
            order: 3,
          },
        ],
      },
    },
  });

  console.log({ admin, client, teamMember, survey });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 