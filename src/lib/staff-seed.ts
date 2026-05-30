export type ShiftKind = "morning" | "afternoon" | "full" | "off" | "leave";

export type StaffShift = {
  dayIndex: number; // 0 = Mon
  kind: ShiftKind;
};

export type StaffMember = {
  id: string;
  name: string;
  initials: string;
  role: "Stylist" | "Senior stylist" | "Therapist" | "Receptionist" | "Manager";
  joinedAt: string;
  hourlyRate: number;
  commissionPercent: number;
  monthlyRevenue: number;
  monthlyServices: number;
  rating: number;
  utilization: number;
  shifts: StaffShift[];
  certifications: string[];
};

export const staffRoster: StaffMember[] = [
  {
    id: "u-001",
    name: "Priya Mathew",
    initials: "PM",
    role: "Senior stylist",
    joinedAt: "Jan 2023",
    hourlyRate: 380,
    commissionPercent: 22,
    monthlyRevenue: 312400,
    monthlyServices: 168,
    rating: 4.9,
    utilization: 92,
    certifications: ["Olaplex Master", "L'Oréal Color Pro"],
    shifts: [
      { dayIndex: 0, kind: "full" },
      { dayIndex: 1, kind: "full" },
      { dayIndex: 2, kind: "full" },
      { dayIndex: 3, kind: "off" },
      { dayIndex: 4, kind: "full" },
      { dayIndex: 5, kind: "morning" },
      { dayIndex: 6, kind: "off" },
    ],
  },
  {
    id: "u-002",
    name: "Rohan Sengupta",
    initials: "RS",
    role: "Stylist",
    joinedAt: "Mar 2024",
    hourlyRate: 280,
    commissionPercent: 18,
    monthlyRevenue: 182600,
    monthlyServices: 142,
    rating: 4.7,
    utilization: 76,
    certifications: ["Wahl Master Barber"],
    shifts: [
      { dayIndex: 0, kind: "afternoon" },
      { dayIndex: 1, kind: "full" },
      { dayIndex: 2, kind: "full" },
      { dayIndex: 3, kind: "full" },
      { dayIndex: 4, kind: "full" },
      { dayIndex: 5, kind: "full" },
      { dayIndex: 6, kind: "afternoon" },
    ],
  },
  {
    id: "u-003",
    name: "Sneha Iyer",
    initials: "SI",
    role: "Therapist",
    joinedAt: "Aug 2023",
    hourlyRate: 320,
    commissionPercent: 20,
    monthlyRevenue: 248900,
    monthlyServices: 124,
    rating: 4.8,
    utilization: 84,
    certifications: ["Hydra Facial Pro", "Glycolic Specialist"],
    shifts: [
      { dayIndex: 0, kind: "full" },
      { dayIndex: 1, kind: "leave" },
      { dayIndex: 2, kind: "full" },
      { dayIndex: 3, kind: "full" },
      { dayIndex: 4, kind: "full" },
      { dayIndex: 5, kind: "afternoon" },
      { dayIndex: 6, kind: "off" },
    ],
  },
  {
    id: "u-004",
    name: "Deepa Rao",
    initials: "DR",
    role: "Stylist",
    joinedAt: "Nov 2024",
    hourlyRate: 240,
    commissionPercent: 16,
    monthlyRevenue: 108200,
    monthlyServices: 96,
    rating: 4.6,
    utilization: 65,
    certifications: ["OPI Nail Art"],
    shifts: [
      { dayIndex: 0, kind: "morning" },
      { dayIndex: 1, kind: "full" },
      { dayIndex: 2, kind: "off" },
      { dayIndex: 3, kind: "full" },
      { dayIndex: 4, kind: "full" },
      { dayIndex: 5, kind: "full" },
      { dayIndex: 6, kind: "morning" },
    ],
  },
  {
    id: "u-005",
    name: "Mehul Shah",
    initials: "MS",
    role: "Receptionist",
    joinedAt: "Feb 2024",
    hourlyRate: 180,
    commissionPercent: 0,
    monthlyRevenue: 0,
    monthlyServices: 0,
    rating: 4.8,
    utilization: 100,
    certifications: ["Glamify Front-desk Certified"],
    shifts: [
      { dayIndex: 0, kind: "full" },
      { dayIndex: 1, kind: "full" },
      { dayIndex: 2, kind: "full" },
      { dayIndex: 3, kind: "full" },
      { dayIndex: 4, kind: "off" },
      { dayIndex: 5, kind: "full" },
      { dayIndex: 6, kind: "full" },
    ],
  },
  {
    id: "u-006",
    name: "Aanya Patel",
    initials: "AP",
    role: "Stylist",
    joinedAt: "Jun 2025",
    hourlyRate: 220,
    commissionPercent: 15,
    monthlyRevenue: 78400,
    monthlyServices: 74,
    rating: 4.5,
    utilization: 58,
    certifications: ["Brazilian Blowout"],
    shifts: [
      { dayIndex: 0, kind: "off" },
      { dayIndex: 1, kind: "morning" },
      { dayIndex: 2, kind: "full" },
      { dayIndex: 3, kind: "full" },
      { dayIndex: 4, kind: "afternoon" },
      { dayIndex: 5, kind: "morning" },
      { dayIndex: 6, kind: "off" },
    ],
  },
];

export type LeaveRequest = {
  id: string;
  staffId: string;
  staffName: string;
  type: "Casual" | "Sick" | "Vacation" | "Personal";
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "declined";
};

export const leaveRequests: LeaveRequest[] = [
  { id: "lr-01", staffId: "u-003", staffName: "Sneha Iyer", type: "Sick", fromDate: "May 29", toDate: "May 29", days: 1, reason: "Fever — won't be able to come in tomorrow.", status: "pending" },
  { id: "lr-02", staffId: "u-006", staffName: "Aanya Patel", type: "Vacation", fromDate: "Jun 12", toDate: "Jun 18", days: 7, reason: "Family wedding in Jaipur.", status: "pending" },
  { id: "lr-03", staffId: "u-002", staffName: "Rohan Sengupta", type: "Casual", fromDate: "Jun 03", toDate: "Jun 03", days: 1, reason: "Personal appointment.", status: "approved" },
  { id: "lr-04", staffId: "u-004", staffName: "Deepa Rao", type: "Personal", fromDate: "May 22", toDate: "May 22", days: 1, reason: "Doctor follow-up.", status: "declined" },
];

export function computeMonthlyPayout(member: StaffMember): {
  base: number;
  commission: number;
  total: number;
} {
  const base = member.hourlyRate * 8 * 22;
  const commission = (member.monthlyRevenue * member.commissionPercent) / 100;
  return { base, commission, total: base + commission };
}

export const weekdays: { full: string; short: string }[] = [
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
  { full: "Saturday", short: "Sat" },
  { full: "Sunday", short: "Sun" },
];

export const shiftKindOrder: ShiftKind[] = ["off", "morning", "afternoon", "full", "leave"];

export const shiftKindLabel: Record<ShiftKind, string> = {
  off: "Off",
  morning: "9–14",
  afternoon: "14–20",
  full: "9–20",
  leave: "Leave",
};
