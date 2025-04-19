'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './chart-container';

interface ResponseRateData {
  surveyId: string;
  surveyTitle: string;
  totalResponses: number;
  expectedResponses: number;
  responseRate: number;
}

interface ResponseRateChartProps {
  data: ResponseRateData[];
  className?: string;
}

export function ResponseRateChart({ data, className }: ResponseRateChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: item.surveyTitle,
      rate: item.responseRate,
      total: item.totalResponses,
      expected: item.expectedResponses,
    }));
  }, [data]);

  return (
    <ChartContainer
      title="Survey Response Rates"
      description="Percentage of completed surveys compared to expected responses"
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => `${value}%`}
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Response Rate']}
            labelFormatter={(label) => `Survey: ${label}`}
          />
          <Bar
            dataKey="rate"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            name="Response Rate"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 