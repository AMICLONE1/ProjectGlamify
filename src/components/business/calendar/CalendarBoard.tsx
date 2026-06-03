"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { calendarApi, appointmentsApi, clientsApi, servicesApi, api, type CalendarEvent, type OpeningHours } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { SearchIcon } from "../icons";
import { getUser } from "@/lib/session";

// ─── Colour mapping ───────────────────────────────────────────────────────────

type EventColor = "violet" | "orange" | "green" | "pink" | "yellow" | "gray";

const STATUS_COLOR: Record<string, EventColor> = {
  confirmed: "violet",
  in_progress: "green",
  visited: "green",
  pending: "yellow",
  pending_otp: "yellow",
  completed: "gray",
  cancelled: "gray",
  no_show: "pink",
};

const eventStyle: Record<EventColor, { bar: string; bg: string; text: string; dot: string }> = {
  violet: { bar: "bg-biz-violet-500", bg: "bg-biz-violet-50", text: "text-biz-violet-700", dot: "bg-biz-violet-500" },
  orange: { bar: "bg-biz-orange-500", bg: "bg-biz-orange-300/25", text: "text-biz-orange-600", dot: "bg-biz-orange-500" },
  green: { bar: "bg-biz-green-500", bg: "bg-biz-green-400/15", text: "text-biz-green-500", dot: "bg-biz-green-500" },
  pink: { bar: "bg-biz-pink-500", bg: "bg-biz-pink-200/40", text: "text-biz-pink-500", dot: "bg-biz-pink-500" },
  yellow: { bar: "bg-biz-yellow-500", bg: "bg-biz-yellow-300/25", text: "text-biz-yellow-500", dot: "bg-biz-yellow-500" },
  gray: { bar: "bg-biz-muted-2", bg: "bg-biz-bg", text: "text-biz-muted", dot: "bg-biz-muted-2" },
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000;
const SLOT_MINUTES = 30;
const ROW_HEIGHT_PX = 30;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function weekStart(d: Date) {
  const s = startOfDay(d);
  s.setDate(s.getDate() - s.getDay()); // Sunday start
  return s;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Derive the grid's start/end hour from the shop's opening hours (fallback 9–20).
function gridBounds(hours: OpeningHours | null): { startHour: number; endHour: number } {
  let min = 24 * 60, max = 0;
  if (hours) {
    for (const k of Object.keys(hours)) {
      const h = hours[k];
      if (!h || h.closed) continue;
      min = Math.min(min, timeToMin(h.open));
      max = Math.max(max, timeToMin(h.close));
    }
  }
  if (min >= max) { min = 9 * 60; max = 20 * 60; }
  // Pad to whole hours, clamp to 0–24
  return {
    startHour: Math.max(0, Math.floor(min / 60)),
    endHour: Math.min(24, Math.ceil(max / 60)),
  };
}

function formatLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

type View = "Day" | "Week";

// ─── Main board ───────────────────────────────────────────────────────────────

export function CalendarBoard() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("Week");
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));
  const [search, setSearch] = useState("");
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{ id: string; source: "appointment" | "online" } | null>(null);

  const wkStart = useMemo(() => weekStart(anchor), [anchor]);
  const rangeFrom = view === "Week" ? wkStart : startOfDay(anchor);
  const rangeTo = view === "Week" ? addDays(wkStart, 7) : addDays(startOfDay(anchor), 1);

  const { data, isLoading } = useQuery({
    queryKey: ["calendar", rangeFrom.toISOString(), rangeTo.toISOString()],
    queryFn: () => calendarApi.range(rangeFrom.toISOString(), rangeTo.toISOString()),
    retry: false,
  });

  const events = data?.events ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) => e.title.toLowerCase().includes(q) || e.subtitle.toLowerCase().includes(q));
  }, [events, search]);

  const bounds = useMemo(() => gridBounds(data?.openingHours ?? null), [data]);

  const days = view === "Week"
    ? Array.from({ length: 7 }, (_, i) => addDays(wkStart, i))
    : [startOfDay(anchor)];

  function shift(dir: -1 | 1) {
    setAnchor((a) => addDays(a, dir * (view === "Week" ? 7 : 1)));
  }

  return (
    <>
      <div className="rounded-3xl bg-biz-surface shadow-sm">
        <div className="grid h-[calc(100vh-7rem)] min-h-[640px] grid-cols-1 overflow-hidden rounded-3xl lg:grid-cols-[18rem_1fr]">
          <CalendarSidebar anchor={anchor} setAnchor={setAnchor} events={events} />
          <div className="flex min-w-0 flex-col">
            <CalendarToolbar
              view={view} setView={setView}
              label={rangeLabel(days)}
              onPrev={() => shift(-1)} onNext={() => shift(1)} onToday={() => setAnchor(startOfDay(new Date()))}
              search={search} setSearch={setSearch}
              onNewBooking={() => setShowNewBooking(true)}
            />
            <WeekGrid days={days} events={filtered} bounds={bounds} loading={isLoading} setSelectedEventId={(id, source) => setSelectedEvent({ id, source })} />
          </div>
        </div>
      </div>

      {selectedEvent && (
        <AppointmentPanel
          eventId={selectedEvent.id}
          source={selectedEvent.source}
          onClose={() => setSelectedEvent(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["calendar"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
            setSelectedEvent(null);
          }}
        />
      )}

      {showNewBooking && (
        <NewBookingModal
          defaultDate={anchor}
          onClose={() => setShowNewBooking(false)}
          onBooked={() => {
            setShowNewBooking(false);
            queryClient.invalidateQueries({ queryKey: ["calendar"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          }}
        />
      )}
    </>
  );
}

function rangeLabel(days: Date[]): string {
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  if (days.length === 1) return days[0].toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return `${fmt(days[0])} – ${fmt(days[days.length - 1])}, ${days[0].getFullYear()}`;
}

// ─── Sidebar: mini-month + agenda ─────────────────────────────────────────────

function CalendarSidebar({ anchor, setAnchor, events }: { anchor: Date; setAnchor: (d: Date) => void; events: CalendarEvent[] }) {
  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date(anchor.getFullYear(), anchor.getMonth(), 1));

  useEffect(() => {
    setMonthCursor(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
  }, [anchor]);

  const today = startOfDay(new Date());
  const selWeekStart = weekStart(anchor);
  const selWeekEnd = addDays(selWeekStart, 7);

  const cells = useMemo(() => buildMonth(monthCursor), [monthCursor]);
  const eventDays = useMemo(() => new Set(events.map((e) => startOfDay(new Date(e.startsAt)).getTime())), [events]);

  const upcoming = useMemo(() => {
    return [...events]
      .filter((e) => new Date(e.startsAt) >= today)
      .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
      .slice(0, 8);
  }, [events, today]);

  return (
    <aside className="hidden flex-col gap-4 border-r border-biz-border bg-biz-bg/40 p-4 lg:flex">
      <div className="rounded-2xl bg-biz-surface p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-bold text-biz-ink">
            {monthCursor.toLocaleDateString("en-IN", { month: "long" })}{" "}
            <span className="text-biz-violet-500">{monthCursor.getFullYear()}</span>
          </p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink" aria-label="Previous month">‹</button>
            <button type="button" onClick={() => setMonthCursor((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              className="flex h-6 w-6 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink" aria-label="Next month">›</button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-biz-muted-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-[11px]">
          {cells.map((cell, i) => {
            const inMonth = cell.getMonth() === monthCursor.getMonth();
            const isToday = sameDay(cell, today);
            const inSelWeek = cell >= selWeekStart && cell < selWeekEnd;
            const hasEvents = eventDays.has(cell.getTime());
            return (
              <button key={i} type="button" onClick={() => setAnchor(startOfDay(cell))}
                className={cn(
                  "relative mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  !inMonth && "text-biz-muted-2/60",
                  inMonth && !isToday && !inSelWeek && "text-biz-ink hover:bg-biz-bg",
                  inSelWeek && !isToday && "bg-biz-violet-50 text-biz-violet-700",
                  isToday && "bg-biz-violet-500 font-semibold text-white"
                )}>
                {cell.getDate()}
                {hasEvents && !isToday && <span aria-hidden className={cn("absolute -bottom-0.5 h-1 w-1 rounded-full", inSelWeek ? "bg-biz-violet-500" : "bg-biz-violet-300")} />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-biz-surface p-3 shadow-sm">
        <p className="px-1 text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Upcoming</p>
        {upcoming.length === 0 ? (
          <p className="mt-4 px-1 text-xs text-biz-muted-2">No upcoming appointments.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((e) => {
              const s = eventStyle[STATUS_COLOR[e.status] ?? "violet"];
              const d = new Date(e.startsAt);
              return (
                <li key={e.id} className="flex items-start gap-2 px-1">
                  <span aria-hidden className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", s.dot)} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-biz-muted">
                      {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {formatLabel(d.getHours() * 60 + d.getMinutes())}
                    </p>
                    <p className="truncate text-xs font-semibold text-biz-ink">{e.title}</p>
                    <p className="truncate text-[10px] text-biz-muted-2">{e.subtitle}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

function buildMonth(monthStart: Date): Date[] {
  const first = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

function CalendarToolbar({
  view, setView, label, onPrev, onNext, onToday, search, setSearch, onNewBooking,
}: {
  view: View; setView: (v: View) => void; label: string;
  onPrev: () => void; onNext: () => void; onToday: () => void;
  search: string; setSearch: (v: string) => void;
  onNewBooking: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-biz-border px-5 py-3">
      <div className="flex items-center gap-1">
        <button type="button" onClick={onPrev} className="flex h-7 w-7 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink" aria-label="Previous">‹</button>
        <button type="button" onClick={onToday} className="rounded-md bg-biz-bg px-3 py-1 text-xs font-semibold text-biz-ink hover:bg-biz-border">Today</button>
        <button type="button" onClick={onNext} className="flex h-7 w-7 items-center justify-center rounded-md text-biz-muted hover:bg-biz-bg hover:text-biz-ink" aria-label="Next">›</button>
      </div>

      <p className="text-sm font-semibold text-biz-ink">{label}</p>

      <div className="mx-auto flex items-center gap-4 text-xs font-medium">
        {(["Day", "Week"] as View[]).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)}
            className={cn("rounded-full px-3 py-1 transition-colors", view === v ? "bg-biz-violet-500 text-white" : "text-biz-muted hover:text-biz-ink")}>
            {v}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-full bg-biz-bg px-3 py-1.5 text-xs text-biz-muted">
        <SearchIcon className="h-3.5 w-3.5 text-biz-muted-2" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-32 bg-transparent text-xs text-biz-ink placeholder:text-biz-muted-2 focus:outline-none" />
      </div>

      <button
        type="button"
        onClick={onNewBooking}
        className="rounded-full bg-biz-violet-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-biz-violet-600"
      >
        + New booking
      </button>
    </div>
  );
}

// ─── Week / Day grid ──────────────────────────────────────────────────────────

function WeekGrid({ days, events, bounds, loading, setSelectedEventId }: {
  days: Date[]; events: CalendarEvent[]; bounds: { startHour: number; endHour: number }; loading: boolean;
  setSelectedEventId: (id: string, source: "appointment" | "online") => void;
}) {
  const { startHour, endHour } = bounds;
  const slotsTotal = (endHour - startHour) * (60 / SLOT_MINUTES);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const today = startOfDay(new Date());

  const scrollRef = useRef<HTMLDivElement>(null);
  // Auto-scroll to 9am (or grid start) on mount.
  useEffect(() => {
    if (scrollRef.current) {
      const target = Math.max(0, (9 - startHour) * 2 * ROW_HEIGHT_PX);
      scrollRef.current.scrollTop = target;
    }
  }, [startHour]);

  const cols = `3rem repeat(${days.length}, 1fr) 3rem`;

  // Group events by day index
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    days.forEach((_, i) => map.set(i, []));
    for (const e of events) {
      const start = new Date(e.startsAt);
      const idx = days.findIndex((d) => sameDay(d, start));
      if (idx >= 0) map.get(idx)!.push(e);
    }
    return map;
  }, [events, days]);

  const minutesToTop = (minutes: number) => ((minutes - startHour * 60) / SLOT_MINUTES) * ROW_HEIGHT_PX;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
      {/* Day strip */}
      <div className="grid border-b border-biz-border" style={{ gridTemplateColumns: cols }}>
        <div />
        {days.map((d, i) => {
          const isToday = sameDay(d, today);
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          return (
            <div key={i} className={cn("border-l border-biz-border py-3 text-center", isWeekend && "bg-biz-bg/40")}>
              <p className="text-[10px] font-semibold tracking-wider text-biz-muted-2">
                {d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase()}
              </p>
              <div className="mt-1 flex items-center justify-center">
                {isToday ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-biz-violet-500 text-sm font-bold text-white">{d.getDate()}</span>
                ) : (
                  <span className="text-sm font-semibold text-biz-ink">{d.getDate()}</span>
                )}
              </div>
            </div>
          );
        })}
        <div className="border-l border-biz-border py-3 text-center text-[10px] font-semibold tracking-wider text-biz-muted-2">
          IST<p className="mt-1 text-[9px] font-normal text-biz-muted-2">GMT+5</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 rounded-full border-2 border-biz-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: cols }}>
            <TimeGutter hours={hours} />

            {days.map((d, i) => {
              const dayEvents = eventsByDay.get(i) ?? [];
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const isToday = sameDay(d, today);
              return (
                <div key={i} className={cn("relative border-l border-biz-border", isWeekend && "bg-biz-bg/30", isToday && "bg-biz-violet-50/30")}
                  style={{ height: ROW_HEIGHT_PX * slotsTotal }}>
                  {Array.from({ length: slotsTotal }).map((_, idx) => (
                    <div key={idx}
                      className={cn("absolute left-0 right-0", idx % 2 === 1 ? "border-b border-dashed border-biz-border/60" : "border-b border-biz-border")}
                      style={{ top: idx * ROW_HEIGHT_PX, height: ROW_HEIGHT_PX }} />
                  ))}

                  {dayEvents.map((e) => {
                    const start = new Date(e.startsAt);
                    const end = new Date(e.endsAt);
                    const startMin = start.getHours() * 60 + start.getMinutes();
                    const endMin = end.getHours() * 60 + end.getMinutes();
                    const top = minutesToTop(startMin);
                    const height = Math.max(((endMin - startMin) / SLOT_MINUTES) * ROW_HEIGHT_PX - 2, 28);
                    const s = eventStyle[STATUS_COLOR[e.status] ?? "violet"];
                    return (
                      <button key={e.id} type="button"
                        onClick={() => setSelectedEventId(e.id, e.source)}
                        className={cn("absolute left-1 right-1 overflow-hidden rounded-md text-left transition-all hover:shadow-md hover:brightness-105", s.bg)}
                        style={{ top, height }} title={`${e.title} · ${e.subtitle}`}>
                        <div className="flex h-full">
                          <span aria-hidden className={cn("w-1 shrink-0 rounded-l-md", s.bar)} />
                          <div className="min-w-0 flex-1 px-2 py-1">
                            <p className={cn("text-[10px] font-medium", s.text)}>{formatLabel(startMin)}</p>
                            <p className="truncate text-[11px] font-semibold text-biz-ink">{e.title}</p>
                            {height > 38 && <p className="truncate text-[10px] text-biz-muted">{e.subtitle}</p>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}

            <TimeGutter hours={hours} side="right" />
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="pointer-events-none flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm font-medium text-biz-ink">No appointments this {days.length === 1 ? "day" : "week"}</p>
            <p className="mt-1 text-xs text-biz-muted">Online bookings and appointments will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeGutter({ hours, side }: { hours: number[]; side?: "right" }) {
  return (
    <div className={cn(side === "right" && "border-l border-biz-border")}>
      <div className="relative" style={{ height: ROW_HEIGHT_PX * hours.length * 2 }}>
        {hours.map((h, i) => (
          <div key={h} className="absolute right-0 left-0 pr-1 pl-1 text-[10px] font-medium text-biz-muted-2"
            style={{ top: i * ROW_HEIGHT_PX * 2 - 4, textAlign: side === "right" ? "left" : "right" }}>
            {((h + 11) % 12) + 1} <span className="lowercase">{h < 12 ? "am" : "pm"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── New Booking Modal ────────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl bg-biz-bg px-3 py-2.5 text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none focus:ring-2 focus:ring-biz-violet-300";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">{label}</label>
      {children}
    </div>
  );
}

function NewBookingModal({ defaultDate, onClose, onBooked }: {
  defaultDate: Date; onClose: () => void; onBooked: () => void;
}) {
  const user = getUser();
  const [clientId, setClientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(() => defaultDate.toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientDebounced, setClientDebounced] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setClientDebounced(clientSearch), 300);
  }, [clientSearch]);

  const { data: clientsData } = useQuery({
    queryKey: ["clients", clientDebounced],
    queryFn: () => clientsApi.list({ q: clientDebounced || undefined, limit: 20 }),
  });
  const { data: servicesData } = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list() });

  const clients = clientsData?.clients ?? [];
  const services = servicesData?.services ?? [];
  const selectedClient = clients.find((c) => c.id === clientId);

  const mutation = useMutation({
    mutationFn: () => {
      const locationId = user?.locationId;
      if (!locationId) throw new Error("No location configured for your account.");
      if (!clientId) throw new Error("Select a client.");
      if (!serviceId) throw new Error("Select a service.");
      const startsAt = new Date(`${date}T${time}:00`).toISOString();
      return appointmentsApi.create({ locationId, clientId, startsAt, serviceIds: [serviceId], notes: notes || undefined });
    },
    onSuccess: onBooked,
    onError: (e) => setError(e instanceof Error ? e.message : "Failed to create booking"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl bg-biz-surface p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-biz-ink">New booking</h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
        </div>

        <div className="space-y-3">
          <Field label="Client *">
            <input
              value={selectedClient ? selectedClient.fullName : clientSearch}
              onChange={(e) => { setClientSearch(e.target.value); setClientId(""); }}
              placeholder="Search by name or phone…"
              className={inputCls}
            />
            {!clientId && clients.length > 0 && clientSearch && (
              <ul className="mt-1 max-h-40 overflow-y-auto rounded-xl border border-biz-border bg-biz-surface shadow-lg">
                {clients.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setClientId(c.id); setClientSearch(c.fullName); }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-biz-bg">
                      <span className="font-medium text-biz-ink">{c.fullName}</span>
                      <span className="ml-2 text-xs text-biz-muted-2">{c.phone ?? ""}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          <Field label="Service *">
            <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={inputCls}>
              <option value="">Select service…</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.durationMinutes}min · ₹{s.price.toLocaleString("en-IN")}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </Field>
            <Field label="Time *">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
            </Field>
          </div>

          <Field label="Notes">
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes…" className={inputCls} />
          </Field>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-2xl bg-biz-bg py-3 text-sm font-semibold text-biz-muted hover:bg-biz-border">
            Cancel
          </button>
          <button
            type="button"
            disabled={!clientId || !serviceId || mutation.isPending}
            onClick={() => mutation.mutate()}
            className="flex-1 rounded-2xl bg-biz-violet-500 py-3 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
          >
            {mutation.isPending ? "Booking…" : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Appointment Detail Panel ────────────────────────────────────────────────

type AptDetail = {
  id: string; status: string; startsAt: string; endsAt: string; notes: string | null;
  client: { id: string; fullName: string; phone: string | null };
  staff: { user: { fullName: string } } | null;
  items: { service: { name: string; durationMinutes: number }; price: number }[];
  invoice: { id: string; status: string; totalAmt: number; invoiceNumber: string } | null;
};

const STATUS_TRANSITIONS: Record<string, { label: string; next: string; tone: string }[]> = {
  pending:     [{ label: "Confirm",     next: "confirmed",   tone: "violet" }, { label: "Cancel", next: "cancelled", tone: "pink" }],
  confirmed:   [{ label: "Start",       next: "in_progress", tone: "green"  }, { label: "No-show", next: "no_show",  tone: "orange" }, { label: "Cancel", next: "cancelled", tone: "pink" }],
  in_progress: [{ label: "Complete",    next: "completed",   tone: "green"  }, { label: "No-show", next: "no_show",  tone: "orange" }],
  completed:   [],
  cancelled:   [],
  no_show:     [],
};

const toneCls: Record<string, string> = {
  violet: "bg-biz-violet-500 text-white hover:bg-biz-violet-600",
  green:  "bg-biz-green-500 text-white hover:opacity-90",
  orange: "bg-biz-orange-500 text-white hover:opacity-90",
  pink:   "bg-biz-pink-500 text-white hover:opacity-90",
};

// Normalised shape for display — same fields regardless of source
type PanelData = {
  customerName: string;
  phone: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  staffName: string | null;
  services: { name: string; price: number }[];
  amount: number | null;
  notes: string | null;
  invoiceNumber: string | null;
  invoiceStatus: string | null;
  source: "appointment" | "online";
};

function normaliseAppointment(a: AptDetail): PanelData {
  return {
    customerName: a.client.fullName,
    phone: a.client.phone,
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    status: a.status,
    staffName: a.staff?.user.fullName ?? null,
    services: a.items.map((it) => ({ name: it.service.name, price: it.price })),
    amount: a.items.reduce((s, it) => s + it.price, 0),
    notes: a.notes,
    invoiceNumber: a.invoice?.invoiceNumber ?? null,
    invoiceStatus: a.invoice?.status ?? null,
    source: "appointment",
  };
}

type OnlineDetail = {
  id: string; status: string; scheduledAt: string; durationMins: number;
  customerName: string; customerPhone: string; totalAmount: number;
  serviceIds: string[];
  services?: { id: string; name: string; price: number; durationMinutes: number }[];
  notes: string | null;
  staffDetail: { user: { fullName: string } } | null;
};

function normaliseOnline(b: OnlineDetail): PanelData {
  const end = new Date(new Date(b.scheduledAt).getTime() + b.durationMins * 60_000).toISOString();
  const services = b.services && b.services.length > 0
    ? b.services.map((s) => ({ name: s.name, price: s.price }))
    : b.serviceIds.length > 0
      ? [{ name: `${b.serviceIds.length} service${b.serviceIds.length > 1 ? "s" : ""} booked online`, price: 0 }]
      : [];
  return {
    customerName: b.customerName,
    phone: b.customerPhone,
    startsAt: b.scheduledAt,
    endsAt: end,
    status: b.status,
    staffName: b.staffDetail?.user.fullName ?? null,
    services,
    amount: b.totalAmount,
    notes: b.notes,
    invoiceNumber: null,
    invoiceStatus: null,
    source: "online",
  };
}

const ONLINE_STATUS_TRANSITIONS: Record<string, { label: string; next: string; tone: string }[]> = {
  pending_otp: [{ label: "Cancel", next: "cancelled", tone: "pink" }],
  confirmed:   [{ label: "Check in", next: "visited", tone: "green" }, { label: "No-show", next: "no_show", tone: "orange" }, { label: "Cancel", next: "cancelled", tone: "pink" }],
  visited:     [],
  cancelled:   [],
  no_show:     [],
};

function AppointmentPanel({ eventId, source, onClose, onUpdated }: {
  eventId: string; source: "appointment" | "online"; onClose: () => void; onUpdated: () => void;
}) {
  const isOnline = source === "online";
  const router = useRouter();

  const { data: aptRaw, isLoading: loadingApt, error: aptError } = useQuery<AptDetail>({
    queryKey: ["appointment", eventId],
    queryFn: () => api.get<AptDetail>(`/appointments/${eventId}`),
    enabled: !isOnline,
    retry: false,
  });

  const { data: onlineRaw, isLoading: loadingOnline, error: onlineError } = useQuery<OnlineDetail>({
    queryKey: ["online-booking", eventId],
    queryFn: () => api.get<OnlineDetail>(`/booking/recent?id=${eventId}`),
    enabled: isOnline,
    retry: false,
  });

  const isLoading = isOnline ? loadingOnline : loadingApt;
  const hasError = isOnline ? !!onlineError : !!aptError;

  const panel: PanelData | null = useMemo(() => {
    if (aptRaw) return normaliseAppointment(aptRaw);
    if (onlineRaw) return normaliseOnline(onlineRaw);
    return null;
  }, [aptRaw, onlineRaw]);

  const transitions = isOnline
    ? [] // online bookings use the custom check-in flow below
    : (STATUS_TRANSITIONS[panel?.status ?? ""] ?? []);

  // Internal appointment status changes
  const mutation = useMutation({
    mutationFn: (next: string) => appointmentsApi.updateStatus(eventId, next),
    onSuccess: onUpdated,
  });

  // Online booking check-in flow
  const [checkinPhase, setCheckinPhase] = useState<"idle" | "code-sent" | "done">("idle");
  const [checkinCode, setCheckinCode] = useState("");
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null); // shown in console mode

  const sendCheckin = useMutation({
    mutationFn: () => api.post<{ sent: boolean; code?: string }>(`/booking/send-checkin`, { bookingId: eventId }),
    onSuccess: (res) => {
      setCheckinPhase("code-sent");
      setCheckinError(null);
      if (res.code) setDevCode(res.code); // dev: show code in UI
    },
    onError: (e) => setCheckinError(e instanceof Error ? e.message : "Failed to send code"),
  });

  const confirmCheckin = useMutation({
    mutationFn: () => {
      const codeToSend = checkinCode.trim() || devCode || "000000";
      return api.post<{ checkedIn: boolean }>(`/booking/checkin`, { bookingId: eventId, code: codeToSend });
    },
    onSuccess: () => { setCheckinPhase("done"); onUpdated(); },
    onError: (e) => setCheckinError(e instanceof Error ? e.message : "Check-in failed"),
  });

  const [remindSent, setRemindSent] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const remind = useMutation({ mutationFn: () => api.post(`/booking/remind`, { bookingId: eventId }), onSuccess: () => setRemindSent(true) });
  const review = useMutation({ mutationFn: () => api.post(`/booking/review`, { bookingId: eventId }), onSuccess: () => setReviewSent(true) });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-biz-surface p-6 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-biz-ink">Appointment</h2>
            {isOnline && (
              <span className="rounded-full bg-biz-green-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-biz-green-500">Online booking</span>
            )}
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-bg text-biz-muted hover:text-biz-ink">✕</button>
        </div>

        {isLoading && (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-biz-violet-500 border-t-transparent" />
          </div>
        )}

        {hasError && !isLoading && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm font-medium text-biz-ink">Could not load details</p>
            <p className="text-xs text-biz-muted">This event may have been deleted or moved.</p>
          </div>
        )}

        {panel && (
          <div className="space-y-4">
            {/* Client */}
            <div className="rounded-2xl bg-biz-bg p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-biz-ink text-sm">{panel.customerName}</p>
                <StatusPill status={panel.status} />
              </div>
              {panel.phone && <p className="text-xs text-biz-muted-2">{panel.phone}</p>}
            </div>

            {/* Time + Staff */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-2xl bg-biz-bg p-3">
                <p className="text-biz-muted-2 uppercase tracking-wider text-[10px]">Time</p>
                <p className="mt-1 font-semibold text-biz-ink">
                  {new Date(panel.startsAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  {" – "}
                  {new Date(panel.endsAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
                <p className="text-biz-muted-2">{new Date(panel.startsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
              <div className="rounded-2xl bg-biz-bg p-3">
                <p className="text-biz-muted-2 uppercase tracking-wider text-[10px]">Staff</p>
                <p className="mt-1 font-semibold text-biz-ink">{panel.staffName ?? "Any stylist"}</p>
              </div>
            </div>

            {/* Services / Amount */}
            <div className="rounded-2xl bg-biz-bg p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2 mb-2">
                {isOnline ? "Services" : "Services"}
              </p>
              {panel.services.length > 0 ? (
                panel.services.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1 text-sm">
                    <span className="text-biz-ink">{s.name}</span>
                    {s.price > 0 && <span className="font-semibold text-biz-ink">₹{s.price.toLocaleString("en-IN")}</span>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-biz-muted">—</p>
              )}
              {panel.amount !== null && panel.amount > 0 && (
                <div className="mt-2 flex items-center justify-between border-t border-biz-border pt-2 text-sm font-bold text-biz-ink">
                  <span>Total</span>
                  <span>₹{panel.amount.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            {/* Invoice (internal appointments only) */}
            {panel.invoiceNumber && (
              <div className="rounded-2xl bg-biz-violet-50 px-4 py-3 text-xs flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-violet-600">Invoice</p>
                  <p className="mt-0.5 font-semibold text-biz-ink">{panel.invoiceNumber}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                  panel.invoiceStatus === "paid" ? "bg-biz-green-400/15 text-biz-green-500" : "bg-biz-orange-300/25 text-biz-orange-600")}>
                  {panel.invoiceStatus}
                </span>
              </div>
            )}

            {/* Notes */}
            {panel.notes && (
              <div className="rounded-2xl bg-biz-bg px-4 py-3 text-xs text-biz-muted">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2 mb-1">Notes</p>
                {panel.notes}
              </div>
            )}

            {/* Internal appointment status actions */}
            {!isOnline && transitions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {transitions.map((t) => (
                  <button key={t.next} type="button" disabled={mutation.isPending}
                    onClick={() => mutation.mutate(t.next)}
                    className={cn("rounded-full px-4 py-2 text-xs font-semibold transition-colors disabled:opacity-50", toneCls[t.tone])}>
                    {mutation.isPending ? "…" : t.label}
                  </button>
                ))}
              </div>
            )}

            {/* Online booking check-in flow */}
            {isOnline && panel.status === "confirmed" && (
              <div className="rounded-2xl bg-biz-bg p-4 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-biz-muted-2">Customer check-in</p>

                {checkinPhase === "idle" && (
                  <>
                    <p className="text-xs text-biz-muted">When the customer arrives, press the button below. A 6-digit code will be sent to their phone. They read it aloud — you enter it to confirm arrival.</p>
                    {checkinError && <p className="text-xs text-biz-pink-500">{checkinError}</p>}
                    <button type="button" disabled={sendCheckin.isPending}
                      onClick={() => sendCheckin.mutate()}
                      className="w-full rounded-2xl bg-biz-green-500 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                      {sendCheckin.isPending ? "Sending code…" : "Customer arrived — send check-in code"}
                    </button>
                  </>
                )}

                {checkinPhase === "code-sent" && (
                  <>
                    <p className="text-xs text-biz-green-600 font-medium">✓ Code sent to customer's phone</p>
                    {devCode && (
                      <div className="rounded-xl bg-biz-yellow-300/20 px-3 py-2 text-xs">
                        <span className="text-biz-muted-2">Dev mode — code: </span>
                        <span className="font-mono font-bold text-biz-ink">{devCode}</span>
                      </div>
                    )}
                    <p className="text-xs text-biz-muted">Ask the customer to read the 6-digit code from their phone:</p>
                    <input
                      type="text" inputMode="numeric" maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={checkinCode}
                      onChange={(e) => setCheckinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full rounded-xl bg-biz-surface px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.4em] text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
                      autoFocus
                    />
                    {checkinError && <p className="text-xs text-biz-pink-500">{checkinError}</p>}
                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setCheckinPhase("idle"); setCheckinError(null); setDevCode(null); }}
                        className="flex-1 rounded-2xl border border-biz-border py-2 text-xs font-semibold text-biz-muted hover:bg-biz-border">
                        Resend code
                      </button>
                      <button type="button"
                        disabled={confirmCheckin.isPending || (!devCode && checkinCode.length < 6)}
                        onClick={() => confirmCheckin.mutate()}
                        className="flex-2 rounded-2xl bg-biz-violet-500 py-2 text-sm font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50">
                        {confirmCheckin.isPending ? "Confirming…" : "Confirm arrival"}
                      </button>
                    </div>
                  </>
                )}

                {checkinPhase === "done" && (
                  <div className="flex items-center gap-2 rounded-xl bg-biz-green-400/15 px-3 py-2.5">
                    <span className="text-biz-green-500 text-lg">✓</span>
                    <p className="text-sm font-semibold text-biz-green-600">Customer arrived — service in progress</p>
                  </div>
                )}
              </div>
            )}

            {/* Visited state — service done, go to POS */}
            {isOnline && (panel.status === "visited" || checkinPhase === "done") && (
              <div className="rounded-2xl bg-biz-violet-50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-biz-green-500 text-white text-sm">✓</span>
                  <div>
                    <p className="text-sm font-bold text-biz-ink">Customer has arrived</p>
                    <p className="text-xs text-biz-muted">Service in progress · bill when done</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    const phone = panel.phone ?? "";
                    const svcIds = onlineRaw?.services?.map((s) => s.id).join(",") ?? "";
                    const params = new URLSearchParams({
                      phone,
                      name: panel.customerName,
                      ...(svcIds ? { serviceIds: svcIds } : {}),
                    });
                    router.push(`/business/pos?${params}`);
                  }}
                  className="w-full rounded-2xl bg-biz-violet-500 py-3 text-sm font-bold text-white hover:bg-biz-violet-600 transition-colors"
                >
                  Service complete — Go to POS &amp; bill →
                </button>
                <button type="button" disabled={review.isPending || reviewSent} onClick={() => review.mutate()}
                  className="w-full rounded-2xl border border-biz-border py-2 text-xs font-semibold text-biz-muted hover:bg-biz-bg transition-colors disabled:opacity-50">
                  {reviewSent ? "✓ Review request sent" : "Request review via WhatsApp"}
                </button>
              </div>
            )}

            {/* No-show for online bookings */}
            {isOnline && panel.status === "confirmed" && checkinPhase === "idle" && (
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => api.patch(`/booking/recent`, { bookingId: eventId, status: "no_show" }).then(onUpdated).catch(() => {})}
                  className="rounded-full border border-biz-border px-3 py-1.5 text-[11px] font-semibold text-biz-muted hover:border-biz-orange-400 hover:text-biz-orange-600 transition-colors">
                  Mark no-show
                </button>
              </div>
            )}

            {/* Remind — only for pre-arrival */}
            {panel.status === "confirmed" && checkinPhase === "idle" && (
              <div className="border-t border-biz-border pt-3">
                <button type="button" disabled={remind.isPending || remindSent} onClick={() => remind.mutate()}
                  className="rounded-full border border-biz-border px-3 py-1.5 text-[11px] font-semibold text-biz-muted transition-colors hover:border-biz-green-500 hover:text-biz-green-600 disabled:opacity-50">
                  {remindSent ? "✓ Reminder sent" : remind.isPending ? "Sending…" : "Send reminder"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed:   "bg-biz-violet-50 text-biz-violet-700",
    in_progress: "bg-biz-green-400/15 text-biz-green-500",
    visited:     "bg-biz-green-400/15 text-biz-green-600",
    pending:     "bg-biz-yellow-300/25 text-biz-yellow-600",
    pending_otp: "bg-biz-yellow-300/25 text-biz-yellow-600",
    completed:   "bg-biz-bg text-biz-muted",
    cancelled:   "bg-biz-bg text-biz-muted line-through",
    no_show:     "bg-biz-pink-200/40 text-biz-pink-500",
  };
  const labels: Record<string, string> = { in_progress: "In progress", pending: "Pending", pending_otp: "Awaiting OTP", confirmed: "Confirmed", visited: "Arrived", completed: "Completed", cancelled: "Cancelled", no_show: "No-show" };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider", styles[status] ?? "bg-biz-bg text-biz-muted")}>
      {labels[status] ?? status}
    </span>
  );
}
