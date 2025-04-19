import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "@/components/ui/bar-chart";

interface RevenueMetricsProps {
  monthlyRevenue: {
    month: string;
    revenue: number;
    subscriptions: number;
  }[];
  totalRevenue: number;
  mrr: number;
  growthRate: number;
}

export function RevenueMetrics({
  monthlyRevenue,
  totalRevenue,
  mrr,
  growthRate,
}: RevenueMetricsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Recurring Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mrr.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MoM Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {growthRate > 0 ? "+" : ""}
              {growthRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <Bar
            data={monthlyRevenue}
            categories={["revenue", "subscriptions"]}
            index="month"
            valueFormatter={(value) => `$${value.toLocaleString()}`}
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
} 