"use client";

import { create } from "zustand";
import {
  campaignHistory as seedHistory,
  channelLabel,
  segments,
  templates,
  type CampaignHistoryEntry,
  type Channel,
  type SegmentId,
} from "@/lib/campaigns-seed";

type Step = 1 | 2 | 3;

type CampaignsState = {
  step: Step;
  segmentId: SegmentId;
  templateId: string;
  body: string;
  channel: Channel;
  scheduleMode: "now" | "later";
  scheduleAt: string;
  history: CampaignHistoryEntry[];
};

type CampaignsActions = {
  setStep: (step: Step) => void;
  setSegment: (id: SegmentId) => void;
  pickTemplate: (id: string) => void;
  setBody: (body: string) => void;
  setChannel: (c: Channel) => void;
  setScheduleMode: (mode: "now" | "later") => void;
  setScheduleAt: (value: string) => void;
  launch: (audience: number, segmentLabel: string) => void;
};

function defaultDateTime(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.toISOString().slice(0, 16);
}

export const useCampaignsStore = create<CampaignsState & CampaignsActions>((set, get) => ({
  step: 1,
  segmentId: "at-risk",
  templateId: templates[0].id,
  body: templates[0].body,
  channel: "push",
  scheduleMode: "now",
  scheduleAt: defaultDateTime(),
  history: seedHistory,

  setStep: (step) => set({ step }),
  setSegment: (id) => {
    const valid = segments.find((s) => s.id === id);
    if (valid) set({ segmentId: id });
  },
  pickTemplate: (id) => {
    const tmpl = templates.find((t) => t.id === id);
    if (tmpl) set({ templateId: id, body: tmpl.body });
  },
  setBody: (body) => set({ body }),
  setChannel: (channel) => set({ channel }),
  setScheduleMode: (scheduleMode) => set({ scheduleMode }),
  setScheduleAt: (scheduleAt) => set({ scheduleAt }),

  launch: (audience, segmentLabel) => {
    const { channel, history, scheduleMode, scheduleAt } = get();
    const newEntry: CampaignHistoryEntry = {
      id: `CMP-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: `New ${channelLabel[channel]} campaign`,
      channel,
      segmentLabel,
      audience,
      opened: 0,
      rebooked: 0,
      revenue: 0,
      sentAt:
        scheduleMode === "now"
          ? new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
          : `Scheduled · ${scheduleAt}`,
    };
    set({
      history: [newEntry, ...history],
      step: 1,
    });
    console.log(`[campaign:launched]`, newEntry);
  },
}));
