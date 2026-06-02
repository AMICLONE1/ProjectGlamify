"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  agenda,
  calendarEvents,
  miniMonth,
  WEEK_DATES,
  type CalEvent,
  type EventColor,
} from "@/lib/calendar-seed";
import { appointmentsApi, type UpcomingAppointment } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";

const STATUS_COLOR: Record<string, EventColor> = {
  confirmed: "violet",
  in_progress: "green",
  pending: "yellow",
  completed: "gray",
  cancelled: "gray",
  no_show: "pink",
};

function aptToCalEvent(apt: UpcomingAppointment, weekSunday: Date): CalEvent | null {
  const start = new Date(apt.startsAt);
  const end = new Date(apt.endsAt);
  const dayIndex = Math.floor((start.getTime() - weekSunday.getTime()) / 86_400_000);
  if (dayIndex < 0 || dayIndex > 6) return null;
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const svcName = apt.items[0]?.service?.name ?? "Appointment";
  const staffFirst = apt.staff?.user.fullName?.split(" ")[0];
  return {
    id: apt.id,
    dayIndex,
    startMinutes,
    endMinutes,
    title: `${apt.client.fullName} · ${svcName}`,
    subtitle: staffFirst ?? undefined,
    color: STATUS_COLOR[apt.status] ?? "violet",
  };
}

function getWeekSunday(): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 18;
const SLOT_MINUTES = 30;
const ROW_HEIGHT_PX = 30;

const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR }, (_, i) => DAY_START_HOUR + i);
const SLOTS_TOTAL = (DAY_END_HOUR - DAY_START_HOUR) * (60 / SLOT_MINUTES);

const eventStyle: Record<EventColor, { bar: string; bg: string; text: string; dot: string }> = {
  violet: {
    bar: "bg-biz-violet-500",
    bg: "bg-biz-violet-50",
    text: "text-biz-violet-700",
    dot: "bg-biz-violet-500",
  },
  orange: {
    bar: "bg-biz-orange-500",
    bg: "bg-biz-orange-300/25",
    text: "text-biz-orange-600",
    dot: "bg-biz-orange-500",
  },
  green: {
    bar: "bg-biz-green-500",
    bg: "bg-biz-green-400/15",
    text: "text-biz-green-500",
    dot: "bg-biz-green-500",
  },
  pink: {
    bar: "bg-biz-pink-500",
    bg: "bg-biz-pink-200/40",
    text: "text-biz-pink-500",
    dot: "bg-biz-pink-500",
  },
  yellow: {
    bar: "bg-biz-yellow-500",
    bg: "bg-biz-yellow-300/25",
    text: "text-biz-yellow-500",
    dot: "bg-biz-yellow-500",
  },
  sky: {
    bar: "bg-sky-500",
    bg: "bg-sky-100",
    text: "text-sky-600",
    dot: "bg-sky-500",
  },
  gray: {
    bar: "bg-biz-muted-2",
    bg: "bg-biz-bg",
    text: "text-biz-muted",
    dot: "bg-biz-muted-2",
  },
};

function minutesToRow(minutes: number) {
  return (minutes - DAY_START_HOUR * 60) / SLOT_MINUTES;
}

function formatLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

type View = "Day" | "Week" | "Month" | "Year";

export function CalendarBoard() {
  const [view, setView] = useState<View>("Week");
  const weekSunday = useMemo(getWeekSunday, []);

  const { data: liveData } = useQuery({
    queryKey: ["appointments", "week", weekSunday.toISOString()],
    queryFn: () =>
      appointmentsApi.list({
        from: weekSunday.toISOString(),
        to: new Date(weekSunday.getTime() + 7 * 86_400_000).toISOString(),
      }),
    retry: false,
  });

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalEvent[]>();
    for (let i = 0; i < 7; i++) map.set(i, []);

    const source: CalEvent[] =
      liveData?.appointments && liveData.appointments.length > 0
        ? liveData.appointments.flatMap((apt) => {
            const e = aptToCalEvent(apt, weekSunday);
            return e ? [e] : [];
          })
        : calendarEvents;

    for (const e of source) {
      const arr = map.get(e.dayIndex);
      if (arr) arr.push(e);
    }
    return map;
  }, [liveData, weekSunday]);

  return (
    <div className="rounded-3xl bg-biz-surface shadow-sm">
      <div className="grid h-[calc(100vh-7rem)] min-h-[640px] grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-[18rem_1fr]">
        <CalendarSidebar />
        <div className="flex min-w-0 flex-col">
          <CalendarToolbar view={view} setView={setView} />
          <WeekGrid eventsByDay={eventsByDay} />
        </div>
      </div>
    </div>
  );
}

function CalendarSidebar() {
  return (
    <aside className="hidden flex-col gap-4 border-r border-biz-border bg-biz-bg/40 p-4 lg:flex">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-biz-violet-500 text-xl font-light text-white hover:bg-biz-violet-600"
        aria-label="New event"
      >
        +
      </button>

      <div className="rounded-2xl bg-biz-surface p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold text-biz-ink">
            May <span className="text-biz-violet-500">2026</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink"
              aria-label="Previous month"
            >
              ‹
            </button>
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink"
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-biz-muted-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-[11px]">
          {miniMonth.map((cell, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                "relative mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                !cell.inMonth && "text-biz-muted-2/60",
                cell.inMonth && !cell.isToday && !cell.inSelectedWeek && "text-biz-ink hover:bg-biz-bg",
                cell.inSelectedWeek && !cell.isToday && "bg-biz-violet-50 text-biz-violet-700",
                cell.isToday && "bg-biz-violet-500 font-semibold text-white"
              )}
            >
              {cell.day}
              {cell.hasEvents && !cell.isToday && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute -bottom-0.5 h-1 w-1 rounded-full",
                    cell.inSelectedWeek ? "bg-biz-violet-500" : "bg-biz-violet-300"
                  )}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-biz-surface p-3 shadow-sm">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">
          Agenda
        </p>
        <div className="mt-3 space-y-4">
          {agenda.map((section) => (
            <div key={section.label}>
              <div className="flex items-baseline gap-2 px-1">
                <span className="text-[11px] font-bold text-biz-violet-600">{section.label}</span>
                <span className="text-[10px] text-biz-muted-2">{section.date}</span>
              </div>
              <ul className="mt-2 space-y-2">
                {section.items.map((item) => {
                  const s = eventStyle[item.color];
                  return (
                    <li key={item.id} className="flex items-start gap-2 px-1">
                      <span
                        aria-hidden
                        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", s.dot)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-biz-muted">{item.time}</p>
                        <p className="truncate text-xs font-semibold text-biz-ink">{item.title}</p>
                        {item.subtitle && (
                          <p className="truncate text-[10px] text-biz-muted-2">{item.subtitle}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

function CalendarToolbar({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-biz-border px-5 py-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink"
          aria-label="Previous week"
        >
          ‹
        </button>
        <button
          type="button"
          className="rounded-md bg-biz-bg px-3 py-1 text-xs font-semibold text-biz-ink hover:bg-biz-border"
        >
          Today
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink"
          aria-label="Next week"
        >
          ›
        </button>
      </div>

      <div className="mx-auto flex items-center gap-4 text-xs font-medium">
        {(["Day", "Week", "Month", "Year"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setView(v)}
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              view === v
                ? "bg-biz-violet-500 text-white"
                : "text-biz-muted hover:text-biz-ink"
            )}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full bg-biz-bg px-3 py-1.5 text-xs text-biz-muted">
        <SearchIcon className="h-3.5 w-3.5 text-biz-muted-2" />
        <input
          type="text"
          placeholder="Search"
          className="w-32 bg-transparent text-xs text-biz-ink placeholder:text-biz-muted-2 focus:outline-none"
        />
      </div>
    </div>
  );
}

function WeekGrid({ eventsByDay }: { eventsByDay: Map<number, CalEvent[]> }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* Sticky day strip */}
      <div className="grid border-b border-biz-border" style={{ gridTemplateColumns: "3rem repeat(7, 1fr) 3rem" }}>
        <div />
        {WEEK_DATES.map((d, i) => (
          <div
            key={i}
            className={cn(
              "border-l border-biz-border py-3 text-center",
              (i === 0 || i === 6) && "bg-biz-bg/40"
            )}
          >
            <p className="text-[10px] font-semibold tracking-wider text-biz-muted-2">{d.weekday}</p>
            <div className="mt-1 flex items-center justify-center">
              {d.isToday ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-biz-violet-500 text-sm font-bold text-white">
                  {d.day}
                </span>
              ) : (
                <span className="text-sm font-semibold text-biz-ink">{d.day}</span>
              )}
            </div>
          </div>
        ))}
        <div className="border-l border-biz-border py-3 text-center text-[10px] font-semibold tracking-wider text-biz-muted-2">
          IST
          <p className="mt-1 text-[9px] font-normal text-biz-muted-2">GMT+5</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: "3rem repeat(7, 1fr) 3rem" }}>
          {/* Left time gutter */}
          <TimeGutter />

          {/* Day columns */}
          {WEEK_DATES.map((d, i) => {
            const events = eventsByDay.get(i) ?? [];
            const isWeekend = i === 0 || i === 6;
            const isToday = d.isToday;
            return (
              <div
                key={i}
                className={cn(
                  "relative border-l border-biz-border",
                  isWeekend && "bg-biz-bg/30",
                  isToday && "bg-biz-violet-50/30"
                )}
                style={{ height: ROW_HEIGHT_PX * SLOTS_TOTAL }}
              >
                {Array.from({ length: SLOTS_TOTAL }).map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "absolute left-0 right-0",
                      idx % 2 === 1
                        ? "border-b border-dashed border-biz-border/60"
                        : "border-b border-biz-border"
                    )}
                    style={{ top: idx * ROW_HEIGHT_PX, height: ROW_HEIGHT_PX }}
                  />
                ))}

                {events.map((e) => {
                  const top = minutesToRow(e.startMinutes) * ROW_HEIGHT_PX;
                  const height = Math.max(
                    ((e.endMinutes - e.startMinutes) / SLOT_MINUTES) * ROW_HEIGHT_PX - 2,
                    28
                  );
                  const s = eventStyle[e.color];
                  return (
                    <button
                      key={e.id}
                      type="button"
                      className={cn(
                        "absolute left-1 right-1 overflow-hidden rounded-md text-left transition-all hover:shadow-md hover:brightness-105",
                        s.bg
                      )}
                      style={{ top, height }}
                    >
                      <div className="flex h-full">
                        <span aria-hidden className={cn("w-1 shrink-0 rounded-l-md", s.bar)} />
                        <div className="min-w-0 flex-1 px-2 py-1">
                          <p className={cn("text-[10px] font-medium", s.text)}>
                            {formatLabel(e.startMinutes)}
                          </p>
                          <p className="truncate text-[11px] font-semibold text-biz-ink">
                            {e.title}
                          </p>
                          {e.subtitle && height > 38 && (
                            <p className="truncate text-[10px] text-biz-muted">{e.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}

          {/* Right time gutter */}
          <TimeGutter side="right" />
        </div>
      </div>
    </div>
  );
}

function TimeGutter({ side }: { side?: "right" }) {
  return (
    <div className={cn(side === "right" && "border-l border-biz-border")}>
      <div className="relative" style={{ height: ROW_HEIGHT_PX * SLOTS_TOTAL }}>
        {HOURS.map((h, i) => (
          <div
            key={h}
            className="absolute right-0 left-0 pr-1 pl-1 text-[10px] font-medium text-biz-muted-2"
            style={{
              top: i * ROW_HEIGHT_PX * 2 - 4,
              textAlign: side === "right" ? "left" : "right",
            }}
          >
            {((h + 11) % 12) + 1} <span className="lowercase">{h < 12 ? "am" : "pm"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
