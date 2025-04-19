import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SurveyList } from "@/components/survey-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

interface SurveyWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  frequency: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  userId: string;
  companyId: string;
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  company: {
    id: string;
    name: string;
  } | null;
  questions: Array<{
    id: string;
    title: string;
    type: string;
    options: string | null;
    required: boolean;
  }>;
  responses: Array<{
    id: string;
    createdAt: Date;
    answers: any;
  }>;
}

export default async function SurveysPage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  // Get the user with company information
  const user = userId ? await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, companyId: true }
  }) : null;

  // Build the where clause based on user role
  let whereClause = {};
  if (userRole === "COMPANY_ADMIN" && user?.companyId) {
    whereClause = { companyId: user.companyId };
  } else if (userRole === "COMPANY_TEAM_MEMBER" && userId) {
    whereClause = { userId };
  }

  const surveys = await prisma.survey.findMany({
    where: whereClause,
    include: {
      client: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      company: {
        select: {
          id: true,
          name: true,
        },
      },
      questions: true,
      responses: true,
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Surveys</h2>
        {userRole === "COMPANY_ADMIN" && (
          <Link href="/surveys/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Survey
            </Button>
          </Link>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Surveys</CardTitle>
        </CardHeader>
        <CardContent>
          <SurveyList surveys={surveys} />
        </CardContent>
      </Card>
    </div>
  );
} 