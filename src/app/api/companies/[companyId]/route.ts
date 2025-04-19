import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const company = await prisma.company.findUnique({
      where: {
        id: params.companyId,
      },
      include: {
        _count: {
          select: {
            users: true,
            clients: true,
            surveys: true,
          },
        },
      },
    });

    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("[COMPANY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, status, subscriptionTier } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const company = await prisma.company.update({
      where: {
        id: params.companyId,
      },
      data: {
        name,
        status,
        subscriptionTier,
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("[COMPANY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { companyId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.company.delete({
      where: {
        id: params.companyId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COMPANY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 