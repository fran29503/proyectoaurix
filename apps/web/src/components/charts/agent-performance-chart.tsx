"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const defaultData = [
  { name: "Youssef N.", leads: 45, closings: 5, sla: 94 },
  { name: "Lina P.", leads: 52, closings: 7, sla: 98 },
  { name: "Aisha R.", leads: 38, closings: 4, sla: 95 },
  { name: "Hassan A.", leads: 35, closings: 2, sla: 78 },
  { name: "Mark R.", leads: 28, closings: 3, sla: 92 },
  { name: "Sofía D.", leads: 22, closings: 2, sla: 88 },
];

interface AgentPerformanceChartProps {
  data?: { name: string; leads: number; closings: number }[];
}

export function AgentPerformanceChart({ data: propData }: AgentPerformanceChartProps = {}) {
  const data = propData && propData.length > 0 ? propData : defaultData;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="closingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          stroke="#94a3b8"
          dy={10}
        />
        <YAxis
          fontSize={11}
          tickLine={false}
          axisLine={false}
          stroke="#94a3b8"
          dx={-10}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "none",
            borderRadius: "12px",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
            fontSize: "12px",
            padding: "12px 16px",
          }}
          labelStyle={{ fontWeight: 600, marginBottom: "4px" }}
          cursor={{ fill: "rgba(139, 92, 246, 0.05)" }}
        />
        <Bar
          dataKey="leads"
          name="Leads"
          fill="url(#leadGradient)"
          radius={[6, 6, 0, 0]}
        />
        <Bar
          dataKey="closings"
          name="Closings"
          fill="url(#closingGradient)"
          radius={[6, 6, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
