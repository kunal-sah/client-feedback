import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Users } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export const metadata: Metadata = {
  title: "Team Members",
  description: "Manage your team members",
};

export default async function TeamPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COMPANY_ADMIN") {
    redirect("/");
  }

  const teamMembers = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId,
      role: "COMPANY_TEAM_MEMBER",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }: { row: any }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
        <Link href="/team/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={teamMembers} />
        </CardContent>
      </Card>
    </div>
  );
} 