"use client";

import { useMemo, useState } from "react";
import { suggestionsForStar, GOOGLE_FUNNEL_MIN_STARS } from "@/content/review-phrases";

type Props = { city: string; slug: string; salonName: string; hasGoogle: boolean };
type Step = "rate" | "write" | "done";

export function ReviewFlow({ city, slug, salonName, hasGoogle }: Props) {
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentToGoogle, setSentToGoogle] = useState(false);

  // Fresh, varied suggestions each time a rating is chosen.
  const suggestions = useMemo(
    () => (rating ? suggestionsForStar(rating, salonName, 4) : []),
    [rating, salonName]
  );

  function pickStar(n: number) {
    setRating(n);
    setText("");
    setStep("write");
  }

  async function submit() {
    if (!name.trim()) { setError("Please add your name."); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/v1/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, slug, rating, authorName: name.trim(), text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Could not submit");

      // Happy customer → bounce to Google to boost the salon's public rating.
      if (data.redirectToGoogle) {
        setSentToGoogle(true);
        setStep("done");
        setTimeout(() => { window.location.href = data.redirectToGoogle; }, 1500);
      } else {
        setStep("done");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-2">Powered by Clitell</p>
          <h1 className="mt-2 text-center font-display text-2xl font-extrabold uppercase tracking-tight text-ink">{salonName}</h1>

          {step === "rate" && (
            <>
              <p className="mt-4 text-center text-sm text-muted">How was your experience?</p>
              <div className="mt-5 flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => pickStar(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="text-4xl leading-none transition-transform hover:scale-110"
                    aria-label={`${n} star`}
                  >
                    <span className={(hover || rating) >= n ? "text-brand-500" : "text-border-strong"}>★</span>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-center text-xs text-muted-2">Tap a star to begin</p>
            </>
          )}

          {step === "write" && (
            <>
              <div className="mt-4 flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setRating(n)} className="text-2xl leading-none" aria-label={`${n} star`}>
                    <span className={rating >= n ? "text-brand-500" : "text-border-strong"}>★</span>
                  </button>
                ))}
              </div>

              <label className="mt-5 block text-xs font-semibold uppercase tracking-wider text-muted-2">Your name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya S."
                className="mt-1.5 w-full rounded-xl border border-border-strong bg-white px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              />

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-2">Pick one — or write your own</p>
              <div className="mt-2 space-y-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setText(s)}
                    className={`w-full rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                      text === s ? "border-brand-500 bg-brand-50 text-brand-700" : "border-border bg-surface-2 text-ink hover:border-brand-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Or type your own review…"
                className="mt-3 w-full resize-none rounded-xl border border-border-strong bg-white px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
              />

              {rating >= GOOGLE_FUNNEL_MIN_STARS && hasGoogle && (
                <p className="mt-2 text-[11px] text-muted-2">After submitting, you&apos;ll be taken to Google to post your review too. 🙏</p>
              )}

              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="mt-4 w-full rounded-full bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </>
          )}

          {step === "done" && (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-3xl">🎉</div>
              <p className="mt-4 text-lg font-bold text-ink">Thank you!</p>
              <p className="mt-1 text-sm text-muted">
                {sentToGoogle ? "Taking you to Google to share it there too…" : "Your feedback helps us improve."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
