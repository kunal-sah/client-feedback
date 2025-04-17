import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    // Check if survey exists and user has access
    const survey = await prisma.survey.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!survey) {
      return new NextResponse("Survey not found", { status: 404 });
    }

    // Only admin and team member can update status
    if (
      session.user.role !== "ADMIN" &&
      session.user.id !== survey.teamMemberId
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedSurvey = await prisma.survey.update({
      where: {
        id: params.id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json(updatedSurvey);
  } catch (error) {
    console.error("[SURVEY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 