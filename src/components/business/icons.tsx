type IconProps = { className?: string };

const base = "h-5 w-5";

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M8 3v3M16 3v3M3 10h18" />
    </svg>
  );
}

export function ClientsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <circle cx="9" cy="9" r="3.5" />
      <path d="M2.5 20c.5-3.6 3.4-6 6.5-6s6 2.4 6.5 6" />
      <circle cx="17" cy="7" r="2.5" />
      <path d="M16 13.5c2.5 0 4.6 1.5 5.3 4" />
    </svg>
  );
}

export function PosIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h2M11 15h2" />
    </svg>
  );
}

export function InventoryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <path d="M3 7l9-4 9 4-9 4-9-4z" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

export function CampaignsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <path d="M3 11v3l13 5V6L3 11z" />
      <path d="M16 9.5a2.5 2.5 0 010 5" />
    </svg>
  );
}

export function ReportsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <path d="M4 19V5M4 19h16" />
      <path d="M8 16V11M12 16V8M16 16V13" />
    </svg>
  );
}

export function StaffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1-3.5 4-5.5 7-5.5s6 2 7 5.5" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 01-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 01-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 01-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 010-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 012.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 014 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 012.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 010 4h-.1a1.7 1.7 0 00-1.5 1z" />
    </svg>
  );
}

export function BellIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <path d="M6 8a6 6 0 0112 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
      <path d="M10.5 21a1.5 1.5 0 003 0" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className ?? base}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export type IconName =
  | "Dashboard"
  | "Calendar"
  | "Clients"
  | "POS"
  | "Inventory"
  | "Campaigns"
  | "Reports"
  | "Staff"
  | "Settings";

export function NavIcon({ name, className }: { name: IconName; className?: string }) {
  switch (name) {
    case "Dashboard":
      return <DashboardIcon className={className} />;
    case "Calendar":
      return <CalendarIcon className={className} />;
    case "Clients":
      return <ClientsIcon className={className} />;
    case "POS":
      return <PosIcon className={className} />;
    case "Inventory":
      return <InventoryIcon className={className} />;
    case "Campaigns":
      return <CampaignsIcon className={className} />;
    case "Reports":
      return <ReportsIcon className={className} />;
    case "Staff":
      return <StaffIcon className={className} />;
    case "Settings":
      return <SettingsIcon className={className} />;
  }
}
