import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Bar } from "@/components/ui/bar-chart";
import { ClipboardList, MessageSquare } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export const metadata: Metadata = {
  title: "Client Dashboard",
  description: "Client dashboard for viewing surveys and responses",
};

export default async function ClientPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "CLIENT") {
    redirect("/");
  }

  // Get client's surveys and responses
  const [surveys, responses] = await Promise.all([
    prisma.survey.findMany({
      where: {
        client: {
          email: session.user.email,
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.response.findMany({
      where: {
        survey: {
          client: {
            email: session.user.email,
          },
        },
      },
      include: {
        survey: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  // Get monthly response data for the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  }).reverse();

  const monthlyResponses = await Promise.all(
    last6Months.map(async (month) => {
      const [year, monthNum] = month.split("-");
      const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

      const count = await prisma.response.count({
        where: {
          survey: {
            client: {
              email: session.user.email,
            },
          },
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      return {
        month: format(startDate, "MMM"),
        responses: count,
      };
    })
  );

  const surveyColumns = [
    {
      accessorKey: "title",
      header: "Survey Title",
    },
    {
      accessorKey: "user.name",
      header: "Team Member",
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

  const responseColumns = [
    {
      accessorKey: "survey.title",
      header: "Survey",
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }: { row: any }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
  ];

  const totalSurveys = surveys.length;
  const completedSurveys = surveys.filter(survey => survey.status === "COMPLETED").length;
  const completionRate = totalSurveys > 0 ? (completedSurveys / totalSurveys) * 100 : 0;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Client Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSurveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Surveys</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSurveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response History</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <Bar
            data={monthlyResponses}
            categories={["responses"]}
            index="month"
            valueFormatter={(value: number) => value.toString()}
            height={350}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={surveyColumns} data={surveys} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={responseColumns} data={responses} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 