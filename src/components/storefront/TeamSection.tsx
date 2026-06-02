import type { Storefront } from "@/content/storefronts";

type Props = { team: Storefront["team"] };

const INITIALS_BG = [
  "bg-brand-100 text-brand-700",
  "bg-surface-2 text-ink",
  "bg-amber-50 text-amber-800",
  "bg-emerald-50 text-emerald-800",
];

export function TeamSection({ team }: Props) {
  if (team.length === 0) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 border-t border-border">
      <h2 className="eyebrow mb-6">Our Team</h2>
      <div className="flex flex-wrap gap-4">
        {team.map((member, i) => {
          const initials = member.name
            .split(" ")
            .slice(0, 2)
            .map((n) => n[0])
            .join("");
          const bgClass = INITIALS_BG[i % INITIALS_BG.length];

          return (
            <div
              key={member.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${bgClass}`}
              >
                {initials}
              </div>
              <div>
                <p className="font-semibold text-ink text-sm">{member.name}</p>
                <p className="text-xs text-muted">{member.role}</p>
                {member.speciality && (
                  <p className="text-xs text-muted-2">{member.speciality}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
