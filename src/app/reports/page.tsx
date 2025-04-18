"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import React from "react";

type SurveyWithResponses = {
  id: string;
  status: "ACTIVE" | "COMPLETED";
  createdAt: Date;
  responses: Array<{
    id: string;
  }>;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface SurveyStat {
  name: string;
  value: number;
}

interface MonthlyTrend {
  month: string;
  surveys: number;
}

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [surveyStats, setSurveyStats] = useState<SurveyStat[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }

    if (status === "authenticated") {
      fetchSurveyData();
    }
  }, [status]);

  const fetchSurveyData = async () => {
    try {
      const surveys = await prisma.survey.findMany({
        include: {
          responses: true,
        },
      }) as SurveyWithResponses[];

      // Process survey statistics
      const stats: SurveyStat[] = [
        {
          name: "Total Surveys",
          value: surveys.length,
        },
        {
          name: "Active Surveys",
          value: surveys.filter((s) => s.status === "ACTIVE").length,
        },
        {
          name: "Completed Surveys",
          value: surveys.filter((s) => s.status === "COMPLETED").length,
        },
        {
          name: "Total Responses",
          value: surveys.reduce((acc, s) => acc + s.responses.length, 0),
        },
      ];

      // Process monthly trends
      const trends: MonthlyTrend[] = surveys.reduce((acc: MonthlyTrend[], survey) => {
        const month = new Date(survey.createdAt).toLocaleString("default", {
          month: "short",
        });
        const existingMonth = acc.find((t) => t.month === month);
        if (existingMonth) {
          existingMonth.surveys += 1;
        } else {
          acc.push({ month, surveys: 1 });
        }
        return acc;
      }, []);

      setSurveyStats(stats);
      setMonthlyTrends(trends);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
        <p>Loading report data...</p>
      </main>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Survey Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={surveyStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {surveyStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Survey Completion Trends ({currentYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="surveys" fill="#8884d8" name="Completed Surveys" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {surveyStats.reduce((acc, curr) => acc + curr.value, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {((surveyStats.find(d => d.name === "COMPLETED")?.value || 0) / 
                surveyStats.reduce((acc, curr) => acc + curr.value, 0) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {surveyStats.find(d => d.name === "IN_PROGRESS")?.value || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
} 