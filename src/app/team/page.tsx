import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Bar } from "@/components/ui/bar-chart";
import { ClipboardList, UserCircle } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Team Member Dashboard",
  description: "Team member dashboard for managing surveys and clients",
};

export default async function TeamMemberPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COMPANY_TEAM_MEMBER") {
    redirect("/");
  }

  // Get assigned surveys and clients
  const [surveys, clients, monthlySurveys, monthlyResponses] = await Promise.all([
    prisma.survey.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    prisma.client.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
    // Get monthly survey counts
    prisma.survey.groupBy({
      by: ["status"],
      where: {
        userId: session.user.id,
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
      _count: true,
    }),
    // Get monthly response counts
    prisma.response.groupBy({
      by: ["surveyId"],
      where: {
        survey: {
          userId: session.user.id,
          createdAt: {
            gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      _count: true,
    }),
  ]);

  const surveyColumns = [
    {
      accessorKey: "title",
      header: "Survey Title",
    },
    {
      accessorKey: "client.name",
      header: "Client",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: { row: any }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
  ];

  const clientColumns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "company",
      header: "Company",
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }: { row: any }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
  ];

  const totalSurveys = monthlySurveys.reduce((acc: number, curr: { _count: number }) => acc + curr._count, 0);
  const totalResponses = monthlyResponses.reduce((acc: number, curr: { _count: number }) => acc + curr._count, 0);
  const responseRate = totalSurveys > 0 ? (totalResponses / totalSurveys) * 100 : 0;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Team Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSurveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{responseRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Surveys</CardTitle>
            <Button asChild>
              <Link href="/surveys/new">Create Survey</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={surveyColumns} data={surveys} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Clients</CardTitle>
            <Button asChild>
              <Link href="/clients/new">Add Client</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={clientColumns} data={clients} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 