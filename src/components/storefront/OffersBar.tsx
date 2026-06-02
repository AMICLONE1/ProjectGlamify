import type { Storefront } from "@/content/storefronts";

type Props = {
  offers: Storefront["offers"];
  loyalty?: Storefront["loyalty"];
};

export function OffersBar({ offers, loyalty }: Props) {
  const activeOffers = offers.filter((o) => {
    if (!o.validTo) return true;
    return new Date(o.validTo) >= new Date();
  });

  if (activeOffers.length === 0 && !loyalty) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 border-t border-border">
      <h2 className="eyebrow mb-5">Offers & Rewards</h2>

      <div className="flex flex-col gap-3">
        {/* Active discount offers */}
        {activeOffers.map((offer) => (
          <div
            key={offer.id}
            className="flex items-start gap-4 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold">
              {offer.type === "percentage" ? `${offer.value}%` : offer.type === "flat" ? "₹" : "★"}
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">{offer.title}</p>
              <p className="text-sm text-muted mt-0.5">{offer.description}</p>
              {offer.validTo && (
                <p className="text-xs text-muted-2 mt-1">
                  Valid till{" "}
                  {new Date(offer.validTo).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Glamify cashback banner */}
        <div className="flex items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
            ₹50
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">First booking cashback</p>
            <p className="text-sm text-muted mt-0.5">
              Book online for the first time and get ₹50 cashback from Glamify — directly to your UPI.
            </p>
            <p className="text-xs text-muted-2 mt-1">One per customer · Glamify platform offer</p>
          </div>
        </div>

        {/* Loyalty program */}
        {loyalty && (
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface-2 px-5 py-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-white text-xs font-bold">
              ★
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">Loyalty rewards</p>
              <p className="text-sm text-muted mt-0.5">{loyalty.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
