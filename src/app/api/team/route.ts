import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    // Hash the password
    const hashedPassword = await hash(password, 12);

    // Create the team member
    const teamMember = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "TEAM_MEMBER",
      },
    });

    return NextResponse.json(teamMember);
  } catch (error) {
    console.error("[TEAM_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 