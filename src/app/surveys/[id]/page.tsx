import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SurveyDetail } from "@/components/survey-detail";
import React from "react";

interface SurveyPageProps {
  params: {
    id: string;
  };
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const survey = await prisma.survey.findUnique({
    where: {
      id: params.id,
    },
    include: {
      client: true,
      user: true,
      questions: {
        orderBy: {
          id: "asc",
        },
      },
      Response: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!survey) {
    notFound();
  }

  // Check if user has access to this survey
  if (
    session.user.role !== "ADMIN" &&
    session.user.id !== survey.clientId &&
    session.user.id !== survey.userId
  ) {
    redirect("/surveys");
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SurveyDetail survey={survey} />
    </main>
  );
} 