"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  channelLabel,
  renderTemplate,
  templates,
  type Channel,
  type SegmentId,
} from "@/lib/campaigns-seed";
import { clientsApi, api, type ClientSummary } from "@/lib/api-client";
import { formatINR } from "@/lib/business-seed";
import { cn } from "@/lib/cn";
import { useCampaignsStore } from "./campaignsStore";

type ApiCampaign = {
  id: string; name: string; channel: Channel; status: string;
  segment: { id: string; label: string };
  body: string; recipientCount: number; openCount: number;
  sentAt: string | null; scheduledAt: string | null; createdAt: string;
};

// Segment definitions computed from REAL clients (no seed data).
type SegmentDef = { id: SegmentId; label: string; description: string; match: (c: ClientSummary) => boolean };
const SEGMENT_DEFS: SegmentDef[] = [
  { id: "vip", label: "VIP regulars", description: "Loyalty 2000+ points.", match: (c) => c.loyaltyPoints >= 2000 },
  { id: "at-risk", label: "At-risk clients", description: "No visit in 45+ days.", match: (c) => !!c.lastVisitAt && (Date.now() - +new Date(c.lastVisitAt)) > 45 * 86_400_000 },
  { id: "birthday", label: "Birthday this month", description: "Tagged 'birthday'.", match: (c) => c.tags.includes("birthday") },
  { id: "new", label: "New clients", description: "Joined in the last 30 days.", match: (c) => (Date.now() - +new Date(c.createdAt)) <= 30 * 86_400_000 },
  { id: "high-spend", label: "High lifetime spend", description: "₹20,000+ lifetime.", match: (c) => c.totalSpend >= 20000 },
  { id: "all", label: "All clients", description: "Everyone in your database.", match: () => true },
];

const channelTone: Record<Channel, string> = {
  push: "bg-biz-violet-50 text-biz-violet-700",
  whatsapp: "bg-biz-green-400/15 text-biz-green-500",
  sms: "bg-biz-orange-300/25 text-biz-orange-600",
  email: "bg-biz-pink-200/40 text-biz-pink-500",
};

export function CampaignsBoard() {
  const step = useCampaignsStore((s) => s.step);
  const segmentId = useCampaignsStore((s) => s.segmentId);
  const templateId = useCampaignsStore((s) => s.templateId);
  const body = useCampaignsStore((s) => s.body);
  const channel = useCampaignsStore((s) => s.channel);
  const scheduleMode = useCampaignsStore((s) => s.scheduleMode);
  const scheduleAt = useCampaignsStore((s) => s.scheduleAt);
  const history = useCampaignsStore((s) => s.history);
  const setStep = useCampaignsStore((s) => s.setStep);
  const setSegment = useCampaignsStore((s) => s.setSegment);
  const pickTemplate = useCampaignsStore((s) => s.pickTemplate);
  const setBody = useCampaignsStore((s) => s.setBody);
  const setChannel = useCampaignsStore((s) => s.setChannel);
  const setScheduleMode = useCampaignsStore((s) => s.setScheduleMode);
  const setScheduleAt = useCampaignsStore((s) => s.setScheduleAt);
  const launch = useCampaignsStore((s) => s.launch);

  const queryClient = useQueryClient();
  const [launchError, setLaunchError] = useState<string | null>(null);

  const { data: clientsData } = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list({ limit: 1000 }) });
  const allClients: ClientSummary[] = useMemo(() => clientsData?.clients ?? [], [clientsData]);

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => api.get<{ campaigns: ApiCampaign[] }>("/campaigns"),
  });
  const apiHistory: ApiCampaign[] = campaignsData?.campaigns ?? [];

  const segment = useMemo(
    () => SEGMENT_DEFS.find((s) => s.id === segmentId) ?? SEGMENT_DEFS[0],
    [segmentId]
  );

  // Real per-segment audience counts from the client database.
  const counts = useMemo(() => {
    const m = {} as Record<SegmentId, number>;
    for (const seg of SEGMENT_DEFS) m[seg.id] = allClients.filter(seg.match).length;
    return m;
  }, [allClients]);

  const audience = counts[segment.id] ?? 0;
  const audienceIds = useMemo(
    () => allClients.filter(segment.match).map((c) => c.id),
    [allClients, segment]
  );
  const previewName = allClients.find(segment.match)?.fullName.split(" ")[0] ?? "Friend";
  const preview = renderTemplate(body, previewName);

  const launchMutation = useMutation({
    mutationFn: () =>
      api.post<{ campaign: ApiCampaign }>("/campaigns", {
        name: `${segment.label} · ${channelLabel[channel]}`,
        channel,
        segmentId,
        segmentLabel: segment.label,
        body,
        scheduleMode,
        scheduleAt: scheduleMode === "later" ? scheduleAt : undefined,
        recipientIds: audienceIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      launch(audience, segment.label); // update local store history too
      setLaunchError(null);
      setStep(1); // reset wizard
    },
    onError: (e) => setLaunchError(e instanceof Error ? e.message : "Launch failed"),
  });

  function handleLaunch() {
    launchMutation.mutate();
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-biz-surface p-6 shadow-sm sm:p-7">
        <div>
          <p className="text-xs font-medium text-biz-violet-600">Campaigns</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-biz-ink sm:text-3xl">
            Build a campaign
          </h1>
          <p className="mt-1.5 text-sm text-biz-muted">
            Three steps · pick a segment, choose a template, schedule the send.
          </p>
        </div>
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          <StepCrumb n={1} label="Segment" active={step === 1} done={step > 1} onClick={() => setStep(1)} />
          <StepCrumb n={2} label="Template" active={step === 2} done={step > 2} onClick={() => setStep(2)} />
          <StepCrumb n={3} label="Schedule" active={step === 3} done={false} onClick={() => setStep(3)} />
        </ol>
      </header>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-3xl bg-biz-surface p-6 shadow-sm">
          {step === 1 && (
            <StepSegment segmentId={segmentId} counts={counts} onPick={setSegment} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <StepTemplate
              templateId={templateId}
              body={body}
              onPick={pickTemplate}
              onChangeBody={setBody}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepSchedule
              channel={channel}
              setChannel={setChannel}
              scheduleMode={scheduleMode}
              setScheduleMode={setScheduleMode}
              scheduleAt={scheduleAt}
              setScheduleAt={setScheduleAt}
              onBack={() => setStep(2)}
              onLaunch={handleLaunch}
              isPending={launchMutation.isPending}
              error={launchError}
            />
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl bg-biz-surface p-5 shadow-sm">
            <p className="text-xs font-medium text-biz-violet-600">Preview</p>
            <div className="mt-3 rounded-2xl bg-biz-bg p-4">
              <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">
                {channelLabel[channel]} → {segment.label}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-biz-ink">
                {preview}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <PreviewStat label="Audience" value={audience.toString()} />
              <PreviewStat label="Channel" value={channelLabel[channel]} />
              <PreviewStat label="Send" value={scheduleMode === "now" ? "Now" : "Later"} />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-biz-violet-500 to-biz-magenta-600 p-5 text-white shadow-lg shadow-biz-violet-500/20">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_45%)]"
            />
            <div className="relative">
              <p className="text-xs font-medium text-white/80">AI nudge</p>
              <p className="mt-2 text-sm leading-relaxed">
                Push campaigns to <span className="font-bold">{segment.label.toLowerCase()}</span> historically convert at <span className="font-bold">5.4×</span>. Keep &quot;Send now&quot; on weekday mornings for best result.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-3xl bg-biz-surface p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-biz-violet-600">Campaign history</p>
          <span className="text-xs text-biz-muted-2">{apiHistory.length} total</span>
        </div>
        {campaignsLoading ? (
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-biz-bg" />)}
          </div>
        ) : apiHistory.length === 0 ? (
          <div className="mt-4 flex h-32 flex-col items-center justify-center rounded-2xl bg-biz-bg text-center">
            <p className="text-sm font-medium text-biz-ink">No campaigns sent yet</p>
            <p className="mt-1 text-xs text-biz-muted">Launch your first campaign above — it&apos;ll show here with open and rebooking stats.</p>
          </div>
        ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm">
            <thead>
              <tr className="border-b border-biz-border text-[10px] uppercase tracking-wider text-biz-muted-2">
                <th className="px-3 py-3 font-semibold">Campaign</th>
                <th className="px-3 py-3 font-semibold">Channel</th>
                <th className="px-3 py-3 font-semibold">Audience</th>
                <th className="px-3 py-3 font-semibold">Delivered</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Sent</th>
              </tr>
            </thead>
            <tbody>
              {apiHistory.map((c) => (
                <tr key={c.id} className="border-b border-biz-border hover:bg-biz-bg">
                  <td className="px-3 py-3">
                    <p className="font-semibold text-biz-ink">{c.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-biz-muted-2">
                      {c.id.slice(-8)} · {c.segment?.label ?? "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", channelTone[c.channel])}>
                      {channelLabel[c.channel]}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-semibold text-biz-ink">{c.recipientCount}</td>
                  <td className="px-3 py-3 text-biz-violet-600">{c.openCount}</td>
                  <td className="px-3 py-3">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      c.status === "sent" ? "bg-biz-green-400/15 text-biz-green-500" :
                      c.status === "scheduled" ? "bg-biz-yellow-300/25 text-biz-yellow-500" :
                      c.status === "sending" ? "bg-biz-violet-50 text-biz-violet-700" :
                      "bg-biz-bg text-biz-muted")}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-biz-muted text-xs">
                    {c.sentAt
                      ? new Date(c.sentAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                      : c.scheduledAt
                        ? `Scheduled · ${new Date(c.scheduledAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </section>
    </div>
  );
}

function StepCrumb({
  n,
  label,
  active,
  done,
  onClick,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
          active
            ? "bg-biz-violet-500 text-white"
            : done
            ? "bg-biz-green-400/15 text-biz-green-500"
            : "bg-biz-bg text-biz-muted hover:text-biz-ink"
        )}
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
          {done ? "✓" : n}
        </span>
        {label}
      </button>
    </li>
  );
}

function StepSegment({
  segmentId,
  counts,
  onPick,
  onNext,
}: {
  segmentId: SegmentId;
  counts: Record<SegmentId, number>;
  onPick: (id: SegmentId) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-biz-violet-600">Step 1 · Segment</p>
      <p className="mt-1 text-sm text-biz-muted">Who should this go to?</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {SEGMENT_DEFS.map((seg) => {
          const active = seg.id === segmentId;
          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => onPick(seg.id)}
              className={cn(
                "rounded-2xl p-4 text-left transition-colors",
                active ? "bg-biz-violet-50 ring-2 ring-biz-violet-300" : "bg-biz-bg hover:bg-biz-violet-50"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-biz-ink">{seg.label}</p>
                <span className="rounded-full bg-biz-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-biz-muted">
                  {counts[seg.id] ?? 0}
                </span>
              </div>
              <p className="mt-1 text-xs text-biz-muted">{seg.description}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-biz-violet-500 px-5 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepTemplate({
  templateId,
  body,
  onPick,
  onChangeBody,
  onBack,
  onNext,
}: {
  templateId: string;
  body: string;
  onPick: (id: string) => void;
  onChangeBody: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-biz-violet-600">Step 2 · Template</p>
      <p className="mt-1 text-sm text-biz-muted">
        Variables: <span className="font-mono text-biz-violet-600">{`{{client_name}}`}</span>,{" "}
        <span className="font-mono text-biz-violet-600">{`{{preferred_stylist}}`}</span>,{" "}
        <span className="font-mono text-biz-violet-600">{`{{points_balance}}`}</span>.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {templates.map((t) => {
          const active = t.id === templateId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(t.id)}
              className={cn(
                "rounded-2xl p-4 text-left transition-colors",
                active ? "bg-biz-violet-50 ring-2 ring-biz-violet-300" : "bg-biz-bg hover:bg-biz-violet-50"
              )}
            >
              <p className="font-semibold text-biz-ink">{t.name}</p>
              <p className="mt-1 text-xs text-biz-muted">{t.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <label className="block text-xs">
          <span className="block text-[10px] uppercase tracking-wider text-biz-muted-2">Message body</span>
          <textarea
            value={body}
            onChange={(e) => onChangeBody(e.target.value)}
            rows={5}
            className="mt-1.5 w-full rounded-2xl bg-biz-bg px-3 py-3 text-sm text-biz-ink placeholder:text-biz-muted-2 focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-biz-bg px-5 py-2 text-xs font-semibold text-biz-ink hover:bg-biz-border"
        >
          ← Segment
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-biz-violet-500 px-5 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

function StepSchedule({
  channel,
  setChannel,
  scheduleMode,
  setScheduleMode,
  scheduleAt,
  setScheduleAt,
  onBack,
  onLaunch,
  isPending,
  error,
}: {
  channel: Channel;
  setChannel: (c: Channel) => void;
  scheduleMode: "now" | "later";
  setScheduleMode: (mode: "now" | "later") => void;
  scheduleAt: string;
  setScheduleAt: (value: string) => void;
  onBack: () => void;
  onLaunch: () => void;
  isPending?: boolean;
  error?: string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-biz-violet-600">Step 3 · Schedule</p>
      <p className="mt-1 text-sm text-biz-muted">Pick channel and send time.</p>

      <p className="mt-5 text-[10px] uppercase tracking-wider text-biz-muted-2">Channel</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["push", "whatsapp", "sms", "email"] as Channel[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              channelTone[c],
              channel === c ? "ring-2 ring-biz-violet-400" : "opacity-80 hover:opacity-100"
            )}
          >
            {channelLabel[c]}
          </button>
        ))}
      </div>

      <p className="mt-6 text-[10px] uppercase tracking-wider text-biz-muted-2">Send time</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-biz-ink">
          <input
            type="radio"
            checked={scheduleMode === "now"}
            onChange={() => setScheduleMode("now")}
            className="accent-biz-violet-500"
          />
          Send now
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-biz-ink">
          <input
            type="radio"
            checked={scheduleMode === "later"}
            onChange={() => setScheduleMode("later")}
            className="accent-biz-violet-500"
          />
          Schedule
        </label>
        {scheduleMode === "later" && (
          <input
            type="datetime-local"
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
            className="rounded-2xl bg-biz-bg px-3 py-2 text-sm text-biz-ink focus:outline-none focus:ring-2 focus:ring-biz-violet-300"
          />
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-2xl bg-biz-pink-200/40 px-4 py-2 text-xs font-medium text-biz-pink-500">{error}</p>
      )}

      <div className="mt-6 flex justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isPending}
          className="rounded-full bg-biz-bg px-5 py-2 text-xs font-semibold text-biz-ink hover:bg-biz-border disabled:opacity-50"
        >
          ← Template
        </button>
        <button
          type="button"
          onClick={onLaunch}
          disabled={isPending}
          className="rounded-full bg-biz-violet-500 px-5 py-2 text-xs font-semibold text-white hover:bg-biz-violet-600 disabled:opacity-50"
        >
          {isPending ? "Launching…" : scheduleMode === "now" ? "Launch campaign" : "Schedule campaign"}
        </button>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-biz-bg p-2 text-center">
      <p className="text-[9px] uppercase tracking-wider text-biz-muted-2">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-biz-ink">{value}</p>
    </div>
  );
}
