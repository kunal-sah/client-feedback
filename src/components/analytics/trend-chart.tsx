'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './chart-container';
import { format } from 'date-fns';

interface TrendData {
  date: string;
  averageScore: number;
  responseCount: number;
}

interface TrendChartProps {
  data: TrendData[];
  className?: string;
}

export function TrendChart({ data, className }: TrendChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: format(new Date(item.date), 'MMM d, yyyy'),
      score: item.averageScore,
      responses: item.responseCount,
    }));
  }, [data]);

  return (
    <ChartContainer
      title="Feedback Trends"
      description="Average feedback scores and response counts over time"
      className={className}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={(value) => value.toFixed(1)}
            domain={[0, 5]}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'score') return [value.toFixed(1), 'Average Score'];
              return [value, 'Response Count'];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            name="Average Score"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="responses"
            stroke="#10b981"
            name="Response Count"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
} 