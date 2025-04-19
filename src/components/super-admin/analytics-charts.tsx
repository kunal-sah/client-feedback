import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  totalUsers: number;
  totalCompanies: number;
  totalClients: number;
  totalSurveys: number;
  totalResponses: number;
  averageResponseRate: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: Date;
  }>;
  userGrowth: Array<{
    date: string;
    count: number;
  }>;
  companyGrowth: Array<{
    date: string;
    count: number;
  }>;
  surveyResponses: Array<{
    date: string;
    count: number;
  }>;
  responseRates: Array<{
    date: string;
    rate: number;
  }>;
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const userGrowthData = {
    labels: data.userGrowth.map(item => item.date),
    datasets: [
      {
        label: 'User Growth',
        data: data.userGrowth.map(item => item.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const companyGrowthData = {
    labels: data.companyGrowth.map(item => item.date),
    datasets: [
      {
        label: 'Company Growth',
        data: data.companyGrowth.map(item => item.count),
        borderColor: 'rgb(153, 102, 255)',
        tension: 0.1,
      },
    ],
  };

  const surveyResponsesData = {
    labels: data.surveyResponses.map(item => item.date),
    datasets: [
      {
        label: 'Survey Responses',
        data: data.surveyResponses.map(item => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const responseRatesData = {
    labels: data.responseRates.map(item => item.date),
    datasets: [
      {
        label: 'Response Rate (%)',
        data: data.responseRates.map(item => item.rate),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const platformMetricsData = {
    labels: ['Users', 'Companies', 'Clients', 'Surveys'],
    datasets: [
      {
        data: [
          data.totalUsers,
          data.totalCompanies,
          data.totalClients,
          data.totalSurveys,
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 99, 132, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
        <Line data={userGrowthData} />
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Company Growth</h3>
        <Line data={companyGrowthData} />
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Survey Responses</h3>
        <Bar data={surveyResponsesData} />
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Response Rates</h3>
        <Line data={responseRatesData} />
      </div>

      <div className="p-6 bg-white rounded-lg shadow md:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Platform Metrics</h3>
        <div className="w-1/2 mx-auto">
          <Doughnut data={platformMetricsData} />
        </div>
      </div>
    </div>
  );
} 