import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const roleTemplateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const roleTemplates = await prisma.roleTemplate.findMany({
      where: { companyId: user.company.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(roleTemplates);
  } catch (error) {
    console.error('Error fetching role templates:', error);
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
      where: { email: session.user.email },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = roleTemplateSchema.parse(body);

    const roleTemplate = await prisma.roleTemplate.create({
      data: {
        ...validatedData,
        companyId: user.company.id,
      },
    });

    return NextResponse.json(roleTemplate);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating role template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 