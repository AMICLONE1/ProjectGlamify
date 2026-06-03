"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatINR } from "@/lib/business-seed";

type MixSlice = { name: string; value: number; color: string };

export function ServiceMixDonut({ data = [], hasData = false }: { data?: MixSlice[]; hasData?: boolean }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (!hasData || total === 0) {
    return (
      <div>
        <h3 className="text-base font-semibold text-biz-ink">Revenue by service</h3>
        <p className="mt-0.5 text-xs text-biz-muted">This month</p>
        <div className="mt-4 flex h-48 flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
          <p className="text-sm font-medium text-biz-ink">No sales yet</p>
          <p className="mt-1 text-xs text-biz-muted">Revenue by service appears once you bill clients.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-base font-semibold text-biz-ink">Revenue by service</h3>
      <p className="mt-0.5 text-xs text-biz-muted">This month · {formatINR(total)} total</p>

      <div className="mt-4 grid grid-cols-[1fr_1.1fr] items-center gap-4">
        <div className="relative aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="100%"
                paddingAngle={3}
                stroke="none"
                cornerRadius={6}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">Total</p>
            <p className="font-display text-lg font-bold text-biz-ink">{formatINR(total)}</p>
          </div>
        </div>

        <ul className="space-y-2.5">
          {data.map((d) => {
            const share = Math.round((d.value / total) * 100);
            return (
              <li key={d.name} className="flex items-center gap-2.5 text-sm">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: d.color }}
                />
                <span className="flex-1 truncate text-biz-ink">{d.name}</span>
                <span className="font-medium text-biz-muted-2">{share}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
