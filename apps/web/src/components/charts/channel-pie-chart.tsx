"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const defaultData = [
  { name: "Meta Ads", value: 647, color: "#8b5cf6" },
  { name: "Portals", value: 555, color: "#10b981" },
  { name: "Google Ads", value: 277, color: "#f59e0b" },
  { name: "Partners", value: 185, color: "#3b82f6" },
  { name: "Organic", value: 111, color: "#06b6d4" },
  { name: "Referral", value: 72, color: "#ec4899" },
];

interface ChannelPieChartProps {
  data?: { name: string; value: number; color: string }[];
}

export function ChannelPieChart({ data: propData }: ChannelPieChartProps = {}) {
  const data = propData && propData.length > 0 ? propData : defaultData;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex items-center gap-6">
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 10px 40px -10px rgba(0,0,0,0.2)",
              fontSize: "12px",
              padding: "12px 16px",
            }}
            formatter={(value) => [
              `${Number(value).toLocaleString()} leads`,
              "",
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 space-y-2">
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-medium text-slate-700">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-slate-900">
              {Math.round((item.value / total) * 100)}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
