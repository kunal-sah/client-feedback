import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";

async function getAnalytics() {
  const analytics = await prisma.$transaction(async (tx) => {
    const [
      companiesPerMonth,
      surveysPerMonth,
      topCompanies,
      userGrowth
    ] = await Promise.all([
      tx.company.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: {
          createdAt: 'desc'
        },
        take: 12
      }),
      tx.survey.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: {
          createdAt: 'desc'
        },
        take: 12
      }),
      tx.company.findMany({
        select: {
          name: true,
          _count: {
            select: {
              surveys: true,
              clients: true,
              users: true
            }
          }
        },
        orderBy: {
          surveys: {
            _count: 'desc'
          }
        },
        take: 5
      }),
      tx.user.groupBy({
        by: ['createdAt'],
        _count: true,
        orderBy: {
          createdAt: 'desc'
        },
        take: 12
      })
    ]);

    return {
      companiesPerMonth,
      surveysPerMonth,
      topCompanies,
      userGrowth
    };
  });

  return analytics;
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const analytics = await getAnalytics();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Company Growth</h3>
          <div className="h-64">
            {/* Add chart component here */}
            <pre className="text-sm">
              {JSON.stringify(analytics.companiesPerMonth, null, 2)}
            </pre>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Survey Activity</h3>
          <div className="h-64">
            {/* Add chart component here */}
            <pre className="text-sm">
              {JSON.stringify(analytics.surveysPerMonth, null, 2)}
            </pre>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">User Growth</h3>
          <div className="h-64">
            {/* Add chart component here */}
            <pre className="text-sm">
              {JSON.stringify(analytics.userGrowth, null, 2)}
            </pre>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Top Companies</h3>
          <div className="space-y-4">
            {analytics.topCompanies.map((company, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="font-medium">{company.name}</span>
                <div className="flex gap-4">
                  <span className="text-sm text-gray-600">
                    {company._count.surveys} surveys
                  </span>
                  <span className="text-sm text-gray-600">
                    {company._count.clients} clients
                  </span>
                  <span className="text-sm text-gray-600">
                    {company._count.users} users
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 