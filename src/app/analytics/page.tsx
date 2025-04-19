'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ResponseRateChart } from '@/components/analytics/response-rate-chart';
import { SentimentChart } from '@/components/analytics/sentiment-chart';
import { TrendChart } from '@/components/analytics/trend-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [responseRateData, setResponseRateData] = useState([]);
  const [sentimentData, setSentimentData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const [responseRateRes, sentimentRes, trendRes] = await Promise.all([
          fetch('/api/analytics/response-rates'),
          fetch('/api/analytics/sentiment'),
          fetch('/api/analytics/trends'),
        ]);

        if (!responseRateRes.ok || !sentimentRes.ok || !trendRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const [responseRateData, sentimentData, trendData] = await Promise.all([
          responseRateRes.json(),
          sentimentRes.json(),
          trendRes.json(),
        ]);

        setResponseRateData(responseRateData);
        setSentimentData(sentimentData);
        setTrendData(trendData);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load analytics data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchAnalyticsData();
    }
  }, [session, toast]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedback Analytics</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ResponseRateChart data={responseRateData} />
        <SentimentChart data={sentimentData} />
        <TrendChart data={trendData} />
      </div>
    </div>
  );
} 