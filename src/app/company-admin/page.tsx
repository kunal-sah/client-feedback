import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Bar } from "@/components/ui/bar-chart";
import { Users, ClipboardList, UserCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Company Admin Dashboard",
  description: "Company admin dashboard for managing teams and clients",
};

export default async function CompanyAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "COMPANY_ADMIN") {
    redirect("/");
  }

  // Get company data
  const company = await prisma.company.findFirst({
    where: {
      users: {
        some: {
          id: session.user.id
        }
      }
    },
    include: {
      _count: {
        select: {
          users: true,
          surveys: true,
          clients: true,
        }
      }
    }
  });

  if (!company) {
    redirect("/");
  }

  // Get the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, "yyyy-MM");
  }).reverse();

  // Fetch metrics
  const [monthlyUsers, monthlySurveys, monthlyClients] = await Promise.all([
    // Monthly user data
    Promise.all(
      last6Months.map(async (month) => {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

        const newUsers = await prisma.user.count({
          where: {
            companyId: company.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        return {
          month: format(startDate, "MMM"),
          users: newUsers,
        };
      })
    ),

    // Monthly survey data
    Promise.all(
      last6Months.map(async (month) => {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

        const surveys = await prisma.survey.count({
          where: {
            companyId: company.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        return {
          month: format(startDate, "MMM"),
          surveys,
        };
      })
    ),

    // Monthly client data
    Promise.all(
      last6Months.map(async (month) => {
        const [year, monthNum] = month.split("-");
        const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0);

        const clients = await prisma.client.count({
          where: {
            companyId: company.id,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        return {
          month: format(startDate, "MMM"),
          clients,
        };
      })
    ),
  ]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Company Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company._count.users}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company._count.surveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company._count.clients}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Growth Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <Bar
            data={[...monthlyUsers, ...monthlySurveys, ...monthlyClients].reduce((acc, curr) => {
              const existing = acc.find(item => item.month === curr.month);
              if (existing) {
                return acc.map(item => 
                  item.month === curr.month 
                    ? { ...item, ...curr }
                    : item
                );
              }
              return [...acc, curr];
            }, [] as any[])}
            categories={["users", "surveys", "clients"]}
            index="month"
            valueFormatter={(value: number) => value.toString()}
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
} 