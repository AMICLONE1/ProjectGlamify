"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR, revenueLast14Days } from "@/lib/business-seed";

export function RevenueSparkline() {
  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={revenueLast14Days} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            stroke="rgba(255,255,255,0.25)"
            tick={{ fill: "rgba(226,232,240,0.6)", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis hide domain={["dataMin - 4000", "dataMax + 4000"]} />
          <Tooltip
            cursor={{ stroke: "rgba(34,211,238,0.5)", strokeWidth: 1 }}
            contentStyle={{
              background: "#04111f",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
              color: "#f1f5f9",
            }}
            labelStyle={{ color: "rgba(226,232,240,0.6)", marginBottom: 4 }}
            formatter={(value, name) => {
              if (name === "revenue") return [formatINR(Number(value)), "Revenue"];
              return [String(value), String(name)];
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="rgb(34,211,238)"
            strokeWidth={2}
            fill="url(#revFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
