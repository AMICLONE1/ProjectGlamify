import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile Preview — Glamify Business",
  description: "Phone-frame preview of the Glamify staff app — today view, walk-in queue, and quick checkout.",
};

export default function BusinessMobilePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-3xl bg-biz-surface p-12 text-center shadow-sm">
      <div className="text-4xl">📱</div>
      <h1 className="font-display text-2xl font-bold text-biz-ink">Mobile Preview</h1>
      <p className="max-w-sm text-sm text-biz-muted">
        A phone-frame preview of the staff app — today&apos;s schedule, walk-in queue, and quick checkout — is coming in Phase A6.
      </p>
    </div>
  );
}
