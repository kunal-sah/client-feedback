import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { surveySchema } from "@/lib/validations/survey";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, clientId } = body;

    if (!title || !clientId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        status: "DRAFT",
        clientId,
        createdById: session.user.id,
        triggerDate: Math.floor(Date.now() / 1000),
      },
    });

    return NextResponse.json(survey);
  } catch (error) {
    console.error("[SURVEYS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const surveys = await prisma.survey.findMany({
      include: {
        client: true,
        responses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(surveys);
  } catch (error) {
    console.error("[SURVEYS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 