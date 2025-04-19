import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "@/components/ui/bar-chart";

interface UserGrowthProps {
  monthlyGrowth: {
    month: string;
    newUsers: number;
    activeUsers: number;
    churnedUsers: number;
  }[];
  totalUsers: number;
  activeUsers: number;
  churnRate: number;
}

export function UserGrowth({
  monthlyGrowth,
  totalUsers,
  activeUsers,
  churnRate,
}: UserGrowthProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{churnRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>User Growth Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <Bar
            data={monthlyGrowth}
            categories={["newUsers", "activeUsers", "churnedUsers"]}
            index="month"
            valueFormatter={(value: number) => value.toString()}
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
} 