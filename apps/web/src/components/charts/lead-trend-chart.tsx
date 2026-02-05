"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { name: "Jan", dubai: 145, usa: 45 },
  { name: "Feb", dubai: 168, usa: 52 },
  { name: "Mar", dubai: 189, usa: 68 },
  { name: "Apr", dubai: 176, usa: 61 },
  { name: "May", dubai: 195, usa: 78 },
  { name: "Jun", dubai: 224, usa: 92 },
  { name: "Jul", dubai: 238, usa: 85 },
  { name: "Aug", dubai: 265, usa: 98 },
  { name: "Sep", dubai: 289, usa: 112 },
  { name: "Oct", dubai: 312, usa: 125 },
  { name: "Nov", dubai: 298, usa: 118 },
  { name: "Dec", dubai: 324, usa: 135 },
];

export function LeadTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorDubai" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1e293b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1e293b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorUsa" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          stroke="#94a3b8"
          dy={10}
        />
        <YAxis
          fontSize={12}
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
        />
        <Area
          type="monotone"
          dataKey="dubai"
          name="Dubai"
          stroke="#1e293b"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorDubai)"
        />
        <Area
          type="monotone"
          dataKey="usa"
          name="USA"
          stroke="#8b5cf6"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#colorUsa)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
