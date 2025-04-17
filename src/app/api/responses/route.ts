import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { responseSchema } from "@/lib/validations/survey";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = responseSchema.parse(body);

    // Check if survey exists and user has access
    const survey = await prisma.survey.findUnique({
      where: {
        id: validatedData.surveyId,
      },
      include: {
        questions: true,
      },
    });

    if (!survey) {
      return new NextResponse("Survey not found", { status: 404 });
    }

    if (
      session.user.role === "CLIENT" &&
      survey.clientId !== session.user.id
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Create response with answers
    const response = await prisma.response.create({
      data: {
        surveyId: validatedData.surveyId,
        userId: session.user.id,
        score: validatedData.score,
        answers: {
          create: validatedData.answers.map((answer) => ({
            questionId: answer.questionId,
            text: answer.text,
            score: answer.score,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    // Update survey status
    await prisma.survey.update({
      where: {
        id: validatedData.surveyId,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[RESPONSES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const surveyId = searchParams.get("surveyId");

    const where = {
      ...(surveyId && { surveyId }),
      ...(session.user.role === "CLIENT" && { userId: session.user.id }),
    };

    const responses = await prisma.response.findMany({
      where,
      include: {
        answers: true,
        survey: {
          include: {
            questions: true,
            client: true,
            teamMember: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error("[RESPONSES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 