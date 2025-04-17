import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const teamMembers = await prisma.user.findMany({
      where: {
        role: "TEAM_MEMBER",
      },
      include: {
        teamMemberSurveys: {
          include: {
            client: true,
            responses: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(teamMembers);
  } catch (error) {
    console.error("[TEAM_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 