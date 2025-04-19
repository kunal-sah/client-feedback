"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: false,
    },
  },
};

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const data = {
  labels,
  datasets: [
    {
      label: "Companies",
      data: labels.map(() => Math.floor(Math.random() * 100)),
      backgroundColor: "rgba(255, 99, 132, 0.5)",
    },
    {
      label: "Users",
      data: labels.map(() => Math.floor(Math.random() * 1000)),
      backgroundColor: "rgba(53, 162, 235, 0.5)",
    },
    {
      label: "Surveys",
      data: labels.map(() => Math.floor(Math.random() * 500)),
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
};

export function Overview() {
  return (
    <div className="h-[350px]">
      <Bar options={options} data={data} />
    </div>
  );
} 