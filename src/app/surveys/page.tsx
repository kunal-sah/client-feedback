import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SurveyList } from "@/components/survey-list";
import { CreateSurveyButton } from "@/components/create-survey-button";

export default async function SurveysPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const surveys = await prisma.survey.findMany({
    where: {
      ...(session.user.role === "CLIENT" && { clientId: session.user.id }),
      ...(session.user.role === "TEAM_MEMBER" && { teamMemberId: session.user.id }),
    },
    include: {
      client: true,
      teamMember: true,
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
        {session.user.role === "ADMIN" && <CreateSurveyButton />}
      </div>
      <SurveyList surveys={surveys} />
    </main>
  );
} 