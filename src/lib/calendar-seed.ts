export type EventColor = "violet" | "orange" | "green" | "pink" | "yellow" | "sky" | "gray";

export type CalEvent = {
  id: string;
  /** 0 = Sun ... 6 = Sat for the visible week */
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
  title: string;
  subtitle?: string;
  color: EventColor;
};

/** Visible week: May 25 (Sun) – May 31 (Sat) 2026 */
export const WEEK_DATES: { weekday: string; day: number; isToday: boolean }[] = [
  { weekday: "SUN", day: 25, isToday: false },
  { weekday: "MON", day: 26, isToday: false },
  { weekday: "TUE", day: 27, isToday: false },
  { weekday: "WED", day: 28, isToday: true },
  { weekday: "THU", day: 29, isToday: false },
  { weekday: "FRI", day: 30, isToday: false },
  { weekday: "SAT", day: 31, isToday: false },
];

export const calendarEvents: CalEvent[] = [
  // Monday
  { id: "e-01", dayIndex: 1, startMinutes: 8 * 60, endMinutes: 9 * 60, title: "Team huddle", subtitle: "Bandra Branch", color: "violet" },
  { id: "e-02", dayIndex: 1, startMinutes: 11 * 60, endMinutes: 12 * 60, title: "Karan M. · Beard trim", subtitle: "Rohan", color: "sky" },
  { id: "e-03", dayIndex: 1, startMinutes: 13 * 60, endMinutes: 14 * 60, title: "Lunch with Aanya", subtitle: "Off-site", color: "yellow" },

  // Tuesday
  { id: "e-10", dayIndex: 2, startMinutes: 9 * 60, endMinutes: 10 * 60 + 30, title: "Riya K. · Keratin treatment", subtitle: "Priya · ₹4,200", color: "orange" },
  { id: "e-11", dayIndex: 2, startMinutes: 10 * 60 + 30, endMinutes: 11 * 60 + 30, title: "Meera J. · Hydra facial", subtitle: "Sneha", color: "violet" },
  { id: "e-12", dayIndex: 2, startMinutes: 14 * 60, endMinutes: 15 * 60, title: "Tanvi R. · Manicure", subtitle: "Deepa", color: "pink" },

  // Wednesday — today
  { id: "e-20", dayIndex: 3, startMinutes: 9 * 60, endMinutes: 10 * 60, title: "Ananya S. · Hair cut + gloss", subtitle: "Priya · PPD allergy ⚠", color: "violet" },
  { id: "e-21", dayIndex: 3, startMinutes: 10 * 60, endMinutes: 11 * 60, title: "Karan M. · Beard trim", subtitle: "Rohan", color: "sky" },
  { id: "e-22", dayIndex: 3, startMinutes: 11 * 60, endMinutes: 13 * 60, title: "Riya K. · Keratin", subtitle: "Priya · ₹4,200", color: "orange" },
  { id: "e-23", dayIndex: 3, startMinutes: 12 * 60, endMinutes: 13 * 60, title: "Walk-in · Mani + Pedi", subtitle: "Deepa", color: "pink" },
  { id: "e-24", dayIndex: 3, startMinutes: 14 * 60, endMinutes: 15 * 60, title: "1:1 with Rohan", subtitle: "Office", color: "yellow" },
  { id: "e-25", dayIndex: 3, startMinutes: 16 * 60, endMinutes: 17 * 60, title: "Inventory review", subtitle: "Stock room", color: "green" },

  // Thursday
  { id: "e-30", dayIndex: 4, startMinutes: 10 * 60, endMinutes: 11 * 60, title: "Deepika I. · Classic facial", subtitle: "Sneha", color: "violet" },
  { id: "e-31", dayIndex: 4, startMinutes: 12 * 60, endMinutes: 13 * 60, title: "Supplier call · Olaplex", subtitle: "Phone", color: "green" },
  { id: "e-32", dayIndex: 4, startMinutes: 15 * 60, endMinutes: 16 * 60, title: "Staff training", subtitle: "Training room", color: "sky" },

  // Friday
  { id: "e-40", dayIndex: 5, startMinutes: 9 * 60, endMinutes: 10 * 60, title: "Vikram S. · Hair cut", subtitle: "Rohan", color: "sky" },
  { id: "e-41", dayIndex: 5, startMinutes: 11 * 60, endMinutes: 12 * 60, title: "Bride trial · Aditi V.", subtitle: "Priya · ₹6,500", color: "pink" },
  { id: "e-42", dayIndex: 5, startMinutes: 14 * 60, endMinutes: 15 * 60, title: "Marketing sync", subtitle: "Zoom", color: "violet" },
  { id: "e-43", dayIndex: 5, startMinutes: 16 * 60, endMinutes: 17 * 60, title: "Weekly review", subtitle: "All-hands", color: "orange" },

  // Saturday — busy
  { id: "e-50", dayIndex: 6, startMinutes: 9 * 60, endMinutes: 10 * 60, title: "Meera J. · Root touch-up", subtitle: "Priya", color: "orange" },
  { id: "e-51", dayIndex: 6, startMinutes: 10 * 60, endMinutes: 11 * 60, title: "Sara K. · Hair gloss", subtitle: "Sneha", color: "violet" },
  { id: "e-52", dayIndex: 6, startMinutes: 11 * 60, endMinutes: 12 * 60, title: "Walk-in · Mani + Pedi", subtitle: "Deepa", color: "pink" },
  { id: "e-53", dayIndex: 6, startMinutes: 13 * 60, endMinutes: 14 * 60, title: "Group booking · Bridal party", subtitle: "Priya + Sneha · ₹18,200", color: "orange" },
];

export type AgendaSection = {
  label: string;
  date: string;
  items: { id: string; time: string; title: string; subtitle?: string; color: EventColor }[];
};

export const agenda: AgendaSection[] = [
  {
    label: "TODAY",
    date: "5/28",
    items: [
      { id: "a-01", time: "9:00 – 10:00 AM", title: "Ananya S. · Hair cut + gloss", subtitle: "Priya · PPD allergy ⚠", color: "violet" },
      { id: "a-02", time: "10:00 – 11:00 AM", title: "Karan M. · Beard trim", subtitle: "Rohan", color: "sky" },
      { id: "a-03", time: "11:00 – 1:00 PM", title: "Riya K. · Keratin", subtitle: "Priya · ₹4,200", color: "orange" },
      { id: "a-04", time: "2:00 – 3:00 PM", title: "1:1 with Rohan", subtitle: "Office", color: "yellow" },
    ],
  },
  {
    label: "TOMORROW",
    date: "5/29",
    items: [
      { id: "a-05", time: "10:00 – 11:00 AM", title: "Deepika I. · Classic facial", subtitle: "Sneha", color: "violet" },
      { id: "a-06", time: "12:00 – 1:00 PM", title: "Supplier call · Olaplex", subtitle: "Phone", color: "green" },
    ],
  },
  {
    label: "FRIDAY",
    date: "5/30",
    items: [
      { id: "a-07", time: "11:00 – 12:00 PM", title: "Bride trial · Aditi V.", subtitle: "Priya · ₹6,500", color: "pink" },
      { id: "a-08", time: "4:00 – 5:00 PM", title: "Weekly review", subtitle: "All-hands", color: "orange" },
    ],
  },
];

/** Mini month for May 2026 — leading 4 days from April, May 1-31, trailing days from June */
export type MiniDay = {
  day: number;
  inMonth: boolean;
  isToday: boolean;
  inSelectedWeek: boolean;
  hasEvents: boolean;
};

export const miniMonth: MiniDay[] = (() => {
  const todayDay = 28;
  // Week of May 25-31 is the selected week
  const selectedWeek = new Set([25, 26, 27, 28, 29, 30, 31]);
  // Days with at least one event in our seed (just visual dots)
  const eventDays = new Set([4, 5, 6, 11, 12, 13, 18, 19, 20, 25, 26, 27, 28, 29, 30, 31]);

  const cells: MiniDay[] = [];

  // April trailing: Apr 26 (Sun) ... Apr 30 (Thu) — 5 cells to align May 1 (Fri)
  for (let d = 26; d <= 30; d++) {
    cells.push({ day: d, inMonth: false, isToday: false, inSelectedWeek: false, hasEvents: false });
  }
  // May 1..31
  for (let d = 1; d <= 31; d++) {
    cells.push({
      day: d,
      inMonth: true,
      isToday: d === todayDay,
      inSelectedWeek: selectedWeek.has(d),
      hasEvents: eventDays.has(d),
    });
  }
  // June leading to fill to 42
  let leadIn = 1;
  while (cells.length < 42) {
    cells.push({ day: leadIn++, inMonth: false, isToday: false, inSelectedWeek: false, hasEvents: false });
  }
  return cells;
})();
