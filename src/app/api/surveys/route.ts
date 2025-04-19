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

    const body = await req.json();
    const { title, description, clientId, teamId } = body;

    if (!title || !clientId || !teamId) {
      return NextResponse.json(
        { error: "Title, client ID, and team ID are required" },
        { status: 400 }
      );
    }

    // Verify the client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Verify the team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found" },
        { status: 404 }
      );
    }

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        clientId,
        teamId,
        teamMemberId: session.user.id,
        triggerDate: Math.floor(Date.now() / 1000),
        status: "DRAFT",
      },
      include: {
        client: true,
        team: true,
        teamMember: true,
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