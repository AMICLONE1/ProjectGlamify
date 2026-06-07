"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type BookingsPoint = { day: string; today: number; yesterday: number };

export function BookingsBarChart({ data = [], hasData = false }: { data?: BookingsPoint[]; hasData?: boolean }) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-biz-ink">Bookings this week</h3>
          <p className="mt-0.5 text-xs text-biz-muted">vs same week last month</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-biz-orange-500" />
            <span className="text-biz-muted">This week</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-biz-violet-500" />
            <span className="text-biz-muted">Last month</span>
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="mt-5 flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
          <p className="text-sm font-medium text-biz-ink">No bookings yet</p>
          <p className="mt-1 text-xs text-biz-muted">Weekly booking volume appears once customers book online.</p>
        </div>
      ) : (
      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height={256} minWidth={0}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#ebe9f1" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#9c95b3"
              tick={{ fill: "#9c95b3", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9c95b3"
              tick={{ fill: "#9c95b3", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(124,58,237,0.06)" }}
              contentStyle={{
                background: "#1a1530",
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                color: "white",
                fontSize: 12,
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)", marginBottom: 4 }}
              formatter={(value, name) => [`${Number(value)} bookings`, name === "today" ? "Today" : "Last month"]}
            />
            <Bar dataKey="yesterday" fill="#7c3aed" radius={[10, 10, 0, 0]} barSize={14}>
              {data.map((_, i) => (
                <Cell key={i} fill="#c4b5fd" />
              ))}
            </Bar>
            <Bar dataKey="today" fill="#f97316" radius={[10, 10, 0, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
}
