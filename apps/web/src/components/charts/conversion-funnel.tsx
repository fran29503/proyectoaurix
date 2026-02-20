"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface FunnelStage {
  name: string;
  value: number;
  percentage: number;
  color: string;
  gradient: string;
}

const defaultFunnelData: FunnelStage[] = [
  { name: "Leads", value: 1847, percentage: 100, color: "bg-slate-500", gradient: "from-slate-400 to-slate-600" },
  { name: "Contacted", value: 1478, percentage: 80, color: "bg-blue-500", gradient: "from-blue-400 to-blue-600" },
  { name: "Qualified", value: 739, percentage: 40, color: "bg-cyan-500", gradient: "from-cyan-400 to-cyan-600" },
  { name: "Meeting", value: 370, percentage: 20, color: "bg-violet-500", gradient: "from-violet-400 to-violet-600" },
  { name: "Offer", value: 185, percentage: 10, color: "bg-amber-500", gradient: "from-amber-400 to-amber-600" },
  { name: "Negotiation", value: 74, percentage: 4, color: "bg-orange-500", gradient: "from-orange-400 to-orange-600" },
  { name: "Closed Won", value: 37, percentage: 2, color: "bg-emerald-500", gradient: "from-emerald-400 to-emerald-600" },
];

interface ConversionFunnelProps {
  data?: FunnelStage[];
  overallConversionRate?: string;
}

export function ConversionFunnel({ data: propData, overallConversionRate }: ConversionFunnelProps = {}) {
  const funnelData = propData && propData.length > 0 ? propData : defaultFunnelData;
  return (
    <div className="space-y-3">
      {funnelData.map((stage, index) => {
        const nextStage = funnelData[index + 1];
        const conversionRate = nextStage
          ? Math.round((nextStage.value / stage.value) * 100)
          : null;

        return (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-sm bg-gradient-to-br", stage.gradient)} />
                <span className="text-sm font-medium text-slate-700">{stage.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">
                  {stage.value.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 w-10 text-right">
                  {stage.percentage}%
                </span>
              </div>
            </div>
            <div className="relative h-7 flex items-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(stage.percentage, 5)}%` }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "h-full rounded-lg bg-gradient-to-r shadow-sm",
                  stage.gradient
                )}
              />
              {conversionRate !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="absolute right-0 flex items-center gap-1 text-xs text-slate-400"
                >
                  <span className="bg-white/90 dark:bg-slate-800/90 px-2 py-0.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                    → {conversionRate}%
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800"
      >
        <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-emerald-800">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Conversion</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{overallConversionRate || "2.0%"}</span>
        </div>
        <div className="flex justify-between items-center mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
          <span className="text-sm text-slate-600 dark:text-slate-400">Avg. Time to Close</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">45 days</span>
        </div>
      </motion.div>
    </div>
  );
}
