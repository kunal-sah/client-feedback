import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { surveySchema } from "@/lib/validations/survey";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, clientId, questions } = await req.json();

    if (!title || !clientId) {
      return NextResponse.json(
        { error: "Title and client ID are required" },
        { status: 400 }
      );
    }

    // Get the user's team
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { team: true },
    });

    if (!user?.team) {
      return NextResponse.json(
        { error: "User must be part of a team" },
        { status: 400 }
      );
    }

    const survey = await prisma.survey.create({
      data: {
        title,
        clientId,
        teamId: user.team.id,
        teamMemberId: session.user.id,
        triggerDate: Math.floor(Date.now() / 1000),
        questions: {
          create: questions?.map((q: any) => ({
            text: q.text,
            type: q.type,
            required: q.required ?? true,
            order: q.order ?? 0,
          })) || [],
        },
      },
      include: {
        client: true,
        team: true,
        teamMember: true,
        questions: true,
      },
    });

    return NextResponse.json(survey);
  } catch (error) {
    console.error("Error creating survey:", error);
    return NextResponse.json(
      { error: "Failed to create survey" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const surveys = await prisma.survey.findMany({
      where: {
        teamMemberId: session.user.id,
      },
      include: {
        client: true,
        team: true,
        teamMember: true,
        questions: true,
        responses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(surveys);
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    );
  }
} 