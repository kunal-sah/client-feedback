import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "@/components/ui/bar-chart";

interface SurveyMetricsProps {
  monthlySurveys: {
    month: string;
    sent: number;
    completed: number;
    responseRate: number;
  }[];
  totalSurveys: number;
  completedSurveys: number;
  averageResponseRate: number;
}

export function SurveyMetrics({
  monthlySurveys,
  totalSurveys,
  completedSurveys,
  averageResponseRate,
}: SurveyMetricsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSurveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Surveys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSurveys}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageResponseRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Survey Completion Overview</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <Bar
            data={monthlySurveys}
            categories={["sent", "completed", "responseRate"]}
            index="month"
            valueFormatter={(value: number) =>
              value.toString() + (value > 1 ? "" : "%")
            }
            height={350}
          />
        </CardContent>
      </Card>
    </div>
  );
} 