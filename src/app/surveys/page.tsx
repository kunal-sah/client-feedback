import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SurveyList } from "@/components/survey-list";
import { CreateSurveyButton } from "@/components/create-survey-button";
import React from "react";

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Team {
  id: string;
  name: string;
}

interface UserWithRelations {
  id: string;
  role: string;
  clients: Client[];
  team: Team | null;
}

export default async function SurveysPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      clients: true,
      team: true,
    },
  }) as UserWithRelations | null;

  if (!user) {
    redirect("/login");
  }

  const surveys = await prisma.survey.findMany({
    where: {
      OR: [
        { clientId: { in: user.clients.map((client: Client) => client.id) } },
        { teamId: user.team?.id },
      ],
    },
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      teamMember: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      questions: true,
      responses: {
        include: {
          answers: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Surveys</h1>
        {user.role === "ADMIN" && <CreateSurveyButton />}
      </div>
      <SurveyList surveys={surveys} />
    </main>
  );
} 