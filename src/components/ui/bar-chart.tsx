import {
  Bar as RechartsBar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface BarProps {
  data: Record<string, any>[];
  categories: string[];
  index: string;
  height?: number;
  valueFormatter?: (value: number) => string;
}

export function Bar({
  data,
  categories,
  index,
  height = 350,
  valueFormatter = (value: number) => value.toString(),
}: BarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <XAxis
          dataKey={index}
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          formatter={valueFormatter}
          cursor={{ fill: "transparent" }}
        />
        <Legend />
        {categories.map((category) => (
          <RechartsBar
            key={category}
            dataKey={category}
            fill={`hsl(${Math.random() * 360}, 70%, 50%)`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
} 