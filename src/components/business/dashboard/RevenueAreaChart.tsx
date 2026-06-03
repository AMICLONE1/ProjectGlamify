"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/business-seed";
import { cn } from "@/lib/cn";

type Range = "7d" | "14d";
type RevenuePoint = { day: string; revenue: number };

export function RevenueAreaChart({ series = [], hasData = false }: { series?: RevenuePoint[]; hasData?: boolean }) {
  const [range, setRange] = useState<Range>("14d");
  const data = range === "7d" ? series.slice(-7) : series;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-biz-ink">Revenue trends</h3>
          <p className="mt-0.5 text-xs text-biz-muted">Last {range === "7d" ? "7" : "14"} days · paid invoices</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-biz-bg p-1">
          {(["7d", "14d"] as Range[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                range === r ? "bg-biz-surface text-biz-ink shadow-sm" : "text-biz-muted hover:text-biz-ink"
              )}
            >
              Last {r === "7d" ? "7 days" : "14 days"}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="mt-6 flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
          <p className="text-sm font-medium text-biz-ink">No revenue yet</p>
          <p className="mt-1 text-xs text-biz-muted">Your daily revenue will appear here once you record sales in POS.</p>
        </div>
      ) : (
      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ebe9f1" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#9c95b3"
              tick={{ fill: "#9c95b3", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              stroke="#9c95b3"
              tick={{ fill: "#9c95b3", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "#7c3aed", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                background: "#1a1530",
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                color: "white",
                fontSize: 12,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
              formatter={(value, name) => {
                if (name === "revenue") return [formatINR(Number(value)), "Revenue"];
                return [`${Number(value)} bookings`, "Bookings"];
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7c3aed"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
