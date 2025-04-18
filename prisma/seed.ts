import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    // Create test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('Created/Updated test user:', user);

    // Create test team
    const team = await prisma.team.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        name: 'Test Team',
        userId: user.id,
      },
    });

    console.log('Created/Updated test team:', team);

    // Create test client
    const client = await prisma.client.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        name: 'Test Client',
        email: 'client@example.com',
        userId: user.id,
      },
    });

    console.log('Created/Updated test client:', client);

    // Create test survey
    const survey = await prisma.survey.upsert({
      where: { 
        id: 'test-survey-id',
      },
      update: {},
      create: {
        id: 'test-survey-id',
        title: 'Test Survey',
        description: 'A test survey for development',
        frequency: 'MONTHLY',
        triggerDate: 1,
        status: 'PENDING',
        clientId: client.id,
        teamId: team.id,
        teamMemberId: user.id,
        questions: {
          create: [
            {
              text: 'How satisfied are you with our service?',
              type: 'RATING',
              required: true,
              order: 1,
            },
            {
              text: 'What can we improve?',
              type: 'TEXT',
              required: false,
              order: 2,
            },
          ],
        },
      },
    });

    console.log('Created/Updated test survey:', survey);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 