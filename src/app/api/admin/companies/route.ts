import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const companySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subscriptionTier: z.enum(["FREE", "BASIC", "PREMIUM", "ENTERPRISE"]),
  subscriptionStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            surveys: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(
      companies.map(company => ({
        id: company.id,
        name: company.name,
        status: company.status,
        createdAt: company.createdAt,
        userCount: company._count.users,
        clientCount: company._count.clients,
        surveyCount: company._count.surveys
      }))
    );
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, status } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        status: status || 'ACTIVE'
      },
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            surveys: true
          }
        }
      }
    });

    return NextResponse.json({
      id: company.id,
      name: company.name,
      status: company.status,
      createdAt: company.createdAt,
      userCount: company._count.users,
      clientCount: company._count.clients,
      surveyCount: company._count.surveys
    });
  } catch (error) {
    console.error('Error creating company:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Company ID is required", { status: 400 });
    }

    await prisma.company.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COMPANIES_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 