"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { getFreshToken } from "@/lib/session";

// ─── Types ────────────────────────────────────────────────────────────────────

type ServiceCategory = { id: string; name: string };
type Service = {
  id: string; name: string; categoryId: string | null;
  category: ServiceCategory | null; durationMinutes: number;
  price: number; description: string | null; isActive: boolean;
};
type Photo = { id: string; url: string; altText: string | null; sortOrder: number };
type Review = {
  id: string; authorName: string; rating: number;
  text: string; date: string; verified: boolean; source: string;
};
type StorefrontData = {
  id: string; slug: string; city: string; area: string;
  tagline: string | null; description: string | null;
  isPublished: boolean;
  photos: Photo[];
  reviews: Review[];
  tenant: {
    name: string;
    locations: Array<{ phone: string | null; address: string | null }>;
    services: Service[];
  };
};

// ─── API helpers ──────────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit) {
  const t = await getFreshToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error?.message ?? `Error ${res.status}`);
  return data?.data;
}

// ─── Shared primitives ────────────────────────────────────────────────────────

const iCls = "w-full rounded-xl border border-border-strong bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-muted-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-ink transition-colors";
const btnPrimary = "inline-flex items-center justify-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:pointer-events-none";
const btnSecondary = "inline-flex items-center justify-center gap-1.5 rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-ink hover:border-ink transition-colors";
const btnDanger = "inline-flex items-center justify-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-2xl leading-none transition-transform hover:scale-110">
          <span className={n <= value ? "text-brand-500" : "text-border-strong"}>★</span>
        </button>
      ))}
    </div>
  );
}

// ─── Tab: Overview (profile editor) ──────────────────────────────────────────

function TabOverview({ data, onSaved }: { data: StorefrontData; onSaved: () => void }) {
  const loc = data.tenant.locations[0];
  const [form, setForm] = useState({
    tagline:     data.tagline ?? "",
    description: data.description ?? "",
    area:        data.area ?? "",
    phone:       loc?.phone ?? "",
    address:     loc?.address ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true); setError(null);
    try {
      await apiFetch("/api/v1/manage/storefront", { method: "PATCH", body: JSON.stringify(form) });
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Business name</label>
          <input value={data.tenant.name} disabled className={iCls + " opacity-60 cursor-not-allowed"} />
          <p className="text-xs text-muted-2 mt-1">Change via account settings</p>
        </div>
        <div>
          <label className="label">Area / locality</label>
          <input value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} placeholder="Bandra West" className={iCls} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Phone</label>
          <div className="flex rounded-xl border border-border-strong bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/30">
            <span className="flex items-center px-3 text-sm text-muted border-r border-border-strong bg-surface-2 shrink-0">+91</span>
            <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value.replace(/\D/g,"").slice(0,10)}))} placeholder="98765 43210" className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Shop 4, Linking Road" className={iCls} />
        </div>
      </div>
      <div>
        <label className="label">Tagline <span className="text-muted-2 font-normal normal-case tracking-normal text-[11px]">({form.tagline.length}/160)</span></label>
        <input value={form.tagline} onChange={e => setForm(f => ({...f, tagline: e.target.value.slice(0,160)}))} placeholder="Your neighbourhood beauty destination" className={iCls} />
      </div>
      <div>
        <label className="label">About <span className="text-muted-2 font-normal normal-case tracking-normal text-[11px]">({form.description.length}/600)</span></label>
        <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value.slice(0,600)}))} rows={4} placeholder="Tell customers about your salon…" className={iCls + " resize-none"} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className={btnPrimary}>
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
        </button>
        <a href={`/${data.city}/${data.slug}`} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
          View storefront →
        </a>
      </div>
    </div>
  );
}

// ─── Tab: Services ────────────────────────────────────────────────────────────

const CATS = ["Hair","Skin","Makeup","Nails","Spa","Beard","Waxing","Other"];
const DURATIONS = [15,30,45,60,75,90,120,150,180,240];

type ServiceForm = { name:string; categoryName:string; durationMinutes:number; price:number; description:string };

const EMPTY_SVC: ServiceForm = { name:"", categoryName:"Hair", durationMinutes:60, price:0, description:"" };

function fmtDur(m: number) {
  if (m < 60) return `${m} min`;
  const h = Math.floor(m/60), r = m%60;
  return r ? `${h}h ${r}m` : `${h}h`;
}

function TabServices({ services: initial, onChanged }: { services: Service[]; onChanged: () => void }) {
  const [services, setServices] = useState<Service[]>(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ServiceForm>(EMPTY_SVC);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ServiceForm>(EMPTY_SVC);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = services.reduce<Record<string, Service[]>>((acc, s) => {
    const cat = s.category?.name ?? "Other";
    acc[cat] = acc[cat] ?? [];
    acc[cat].push(s);
    return acc;
  }, {});

  async function addService() {
    if (!form.name.trim()) { setError("Service name is required"); return; }
    setBusy("add"); setError(null);
    try {
      const data = await apiFetch("/api/v1/manage/services", { method:"POST", body: JSON.stringify(form) });
      setServices(s => [...s, data.service]);
      setForm(EMPTY_SVC); setAdding(false);
      onChanged();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(null); }
  }

  async function saveEdit(id: string) {
    setBusy(id); setError(null);
    try {
      const data = await apiFetch(`/api/v1/manage/services/${id}`, { method:"PATCH", body: JSON.stringify(editForm) });
      setServices(s => s.map(x => x.id === id ? data.service : x));
      setEditId(null);
      onChanged();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(null); }
  }

  async function toggleActive(svc: Service) {
    setBusy(svc.id);
    try {
      const data = await apiFetch(`/api/v1/manage/services/${svc.id}`, { method:"PATCH", body: JSON.stringify({ isActive: !svc.isActive }) });
      setServices(s => s.map(x => x.id === svc.id ? data.service : x));
      onChanged();
    } catch {} finally { setBusy(null); }
  }

  async function deleteService(id: string) {
    if (!confirm("Remove this service? Existing bookings won't be affected.")) return;
    setBusy(id);
    try {
      await apiFetch(`/api/v1/manage/services/${id}`, { method:"DELETE" });
      setServices(s => s.filter(x => x.id !== id));
      onChanged();
    } catch {} finally { setBusy(null); }
  }

  return (
    <div className="space-y-6">
      {/* Category groups */}
      {Object.entries(grouped).map(([cat, svcs]) => (
        <div key={cat}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted mb-2">{cat}</p>
          <div className="rounded-2xl border border-border bg-white divide-y divide-border overflow-hidden">
            {svcs.map(svc => (
              <div key={svc.id}>
                {editId === svc.id ? (
                  <div className="p-4 space-y-3 bg-surface-2">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div><label className="label">Name</label><input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} className={iCls} /></div>
                      <div><label className="label">Category</label>
                        <select value={editForm.categoryName} onChange={e=>setEditForm(f=>({...f,categoryName:e.target.value}))} className={iCls+" appearance-none"}>
                          {CATS.map(c=><option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="label">Price (₹)</label><input type="number" min={0} value={editForm.price} onChange={e=>setEditForm(f=>({...f,price:Number(e.target.value)}))} className={iCls} /></div>
                      <div><label className="label">Duration</label>
                        <select value={editForm.durationMinutes} onChange={e=>setEditForm(f=>({...f,durationMinutes:Number(e.target.value)}))} className={iCls+" appearance-none"}>
                          {DURATIONS.map(d=><option key={d} value={d}>{fmtDur(d)}</option>)}
                        </select>
                      </div>
                    </div>
                    <div><label className="label">Description</label><input value={editForm.description} onChange={e=>setEditForm(f=>({...f,description:e.target.value}))} placeholder="Optional short note" className={iCls} /></div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex gap-2">
                      <button onClick={()=>saveEdit(svc.id)} disabled={busy===svc.id} className={btnPrimary}>{busy===svc.id?"Saving…":"Save"}</button>
                      <button onClick={()=>setEditId(null)} className={btnSecondary}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-between px-4 py-3.5 gap-3 ${!svc.isActive ? "opacity-50" : ""}`}>
                    <div className="min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{svc.name}</p>
                      <p className="text-xs text-muted">{fmtDur(svc.durationMinutes)}{svc.description ? ` · ${svc.description}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold text-sm text-ink">₹{svc.price.toLocaleString("en-IN")}</span>
                      <button onClick={()=>{setEditId(svc.id);setEditForm({name:svc.name,categoryName:svc.category?.name??"Hair",durationMinutes:svc.durationMinutes,price:svc.price,description:svc.description??""});}} className="h-7 w-7 flex items-center justify-center rounded-full border border-border-strong text-muted hover:border-ink hover:text-ink transition-colors" title="Edit">
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L11 4M2 10l1-3L9 2l2 2-6 6-3 1z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                      <button onClick={()=>toggleActive(svc)} disabled={busy===svc.id} className={`h-7 px-2 rounded-full border text-xs font-medium transition-colors ${svc.isActive ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-border-strong text-muted hover:border-ink"}`} title={svc.isActive?"Hide from storefront":"Show on storefront"}>
                        {svc.isActive ? "Live" : "Hidden"}
                      </button>
                      <button onClick={()=>deleteService(svc.id)} disabled={busy===svc.id} className={btnDanger} title="Remove">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {services.length === 0 && !adding && (
        <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-sm text-muted">
          No services yet. Add your first service below.
        </div>
      )}

      {/* Add service form */}
      {adding ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 space-y-3">
          <p className="font-semibold text-ink text-sm">New service</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Name *</label><input autoFocus value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Haircut + Blowdry" className={iCls} /></div>
            <div><label className="label">Category</label>
              <select value={form.categoryName} onChange={e=>setForm(f=>({...f,categoryName:e.target.value}))} className={iCls+" appearance-none"}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Price (₹)</label><input type="number" min={0} value={form.price} onChange={e=>setForm(f=>({...f,price:Number(e.target.value)}))} className={iCls} /></div>
            <div><label className="label">Duration</label>
              <select value={form.durationMinutes} onChange={e=>setForm(f=>({...f,durationMinutes:Number(e.target.value)}))} className={iCls+" appearance-none"}>
                {DURATIONS.map(d=><option key={d} value={d}>{fmtDur(d)}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Description (optional)</label><input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Short note…" className={iCls} /></div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={addService} disabled={busy==="add"} className={btnPrimary}>{busy==="add"?"Adding…":"Add service"}</button>
            <button onClick={()=>{setAdding(false);setForm(EMPTY_SVC);setError(null);}} className={btnSecondary}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)} className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-300 text-brand-500 text-lg font-bold leading-none">+</span>
          Add service
        </button>
      )}
    </div>
  );
}

// ─── Tab: Photos ──────────────────────────────────────────────────────────────

function TabPhotos({ photos: initial, storefrontName, onChanged }: { photos: Photo[]; storefrontName: string; onChanged: () => void }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function addPhotoFromUrl() {
    if (!urlInput.trim()) return;
    try { new URL(urlInput); } catch { setUrlError("Enter a valid URL (https://…)"); return; }
    setUploading(true); setUrlError(null);
    try {
      const data = await apiFetch("/api/v1/manage/photos", { method:"POST", body: JSON.stringify({ url: urlInput }) });
      setPhotos(p => [...p, data.photo]);
      setUrlInput("");
      onChanged();
    } catch (e) { setUrlError(e instanceof Error ? e.message : "Failed"); }
    finally { setUploading(false); }
  }

  async function addPhotoFromFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUrlError("File must be under 5MB"); return; }
    setUploading(true); setUrlError(null);
    try {
      const dataUrl = await new Promise<string>((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.onerror = rej;
        reader.readAsDataURL(file);
      });
      const data = await apiFetch("/api/v1/manage/photos", { method:"POST", body: JSON.stringify({ url: dataUrl, altText: file.name }) });
      setPhotos(p => [...p, data.photo]);
      onChanged();
    } catch (e) { setUrlError(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function deletePhoto(id: string) {
    setDeleting(id);
    try {
      await apiFetch(`/api/v1/manage/photos/${id}`, { method:"DELETE" });
      setPhotos(p => p.filter(x => x.id !== id));
      onChanged();
    } catch {} finally { setDeleting(null); }
  }

  return (
    <div className="space-y-6">
      {/* Photos grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={photo.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-border bg-surface-2">
              <Image
                src={photo.url.startsWith("data:") ? photo.url : photo.url}
                alt={photo.altText ?? `${storefrontName} photo ${i+1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized={photo.url.startsWith("data:")}
              />
              {i === 0 && (
                <div className="absolute top-2 left-2 bg-ink/80 text-white text-[10px] font-semibold rounded-full px-2 py-0.5">Main</div>
              )}
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => deletePhoto(photo.id)}
                  disabled={deleting === photo.id}
                  className="h-9 w-9 flex items-center justify-center rounded-full bg-white/90 text-red-600 hover:bg-white shadow-md transition-colors"
                  aria-label="Delete photo"
                >
                  {deleting === photo.id ? (
                    <span className="text-xs">…</span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3.5h8M5.5 3.5V2.5h3v1M5.5 5.5v4M8.5 5.5v4M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-strong p-10 text-center text-sm text-muted">
          No photos yet. Add your first photo below.
        </div>
      )}

      <p className="text-xs text-muted-2">{photos.length}/20 photos · First photo appears as main cover</p>

      {/* Upload section */}
      <div className="rounded-2xl border border-border bg-surface-2 p-5 space-y-4">
        <p className="font-semibold text-ink text-sm">Add photos</p>

        {/* File upload */}
        <div>
          <label className="label mb-2">Upload from device</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-strong bg-white py-8 cursor-pointer hover:border-brand-300 transition-colors"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-muted mb-2"><path d="M14 5v14M7 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 22h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <span className="text-sm text-muted">{uploading ? "Uploading…" : "Tap to upload · JPG, PNG, WEBP · max 5MB"}</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={addPhotoFromFile} />
        </div>

        {/* URL input */}
        <div>
          <label className="label mb-2">Or add by URL</label>
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={e => { setUrlInput(e.target.value); setUrlError(null); }}
              placeholder="https://example.com/photo.jpg"
              className={iCls + " flex-1"}
              onKeyDown={e => e.key === "Enter" && addPhotoFromUrl()}
            />
            <button onClick={addPhotoFromUrl} disabled={uploading || !urlInput.trim()} className={btnPrimary}>
              {uploading ? "Adding…" : "Add"}
            </button>
          </div>
        </div>

        {urlError && <p className="text-xs text-red-600">{urlError}</p>}
      </div>
    </div>
  );
}

// ─── Tab: Reviews ─────────────────────────────────────────────────────────────

type ReviewForm = { authorName: string; rating: number; text: string; date: string; verified: boolean };
const EMPTY_REVIEW: ReviewForm = { authorName: "", rating: 5, text: "", date: new Date().toISOString().split("T")[0], verified: true };

function TabReviews({ reviews: initial, onChanged }: { reviews: Review[]; onChanged: () => void }) {
  const [reviews, setReviews] = useState<Review[]>(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ReviewForm>(EMPTY_REVIEW);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ReviewForm>(EMPTY_REVIEW);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";

  async function addReview() {
    if (!form.authorName.trim() || form.text.trim().length < 5) { setError("Name and review text are required"); return; }
    setBusy("add"); setError(null);
    try {
      const data = await apiFetch("/api/v1/manage/reviews", { method:"POST", body: JSON.stringify(form) });
      setReviews(r => [data.review, ...r]);
      setForm(EMPTY_REVIEW); setAdding(false);
      onChanged();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(null); }
  }

  async function saveEdit(id: string) {
    setBusy(id); setError(null);
    try {
      const data = await apiFetch(`/api/v1/manage/reviews/${id}`, { method:"PATCH", body: JSON.stringify(editForm) });
      setReviews(r => r.map(x => x.id === id ? data.review : x));
      setEditId(null);
      onChanged();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setBusy(null); }
  }

  async function deleteReview(id: string) {
    if (!confirm("Remove this review from your storefront?")) return;
    setBusy(id);
    try {
      await apiFetch(`/api/v1/manage/reviews/${id}`, { method:"DELETE" });
      setReviews(r => r.filter(x => x.id !== id));
      onChanged();
    } catch {} finally { setBusy(null); }
  }

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-white px-5 py-4">
        <div className="text-center">
          <p className="text-3xl font-extrabold text-ink">{avgRating}</p>
          <p className="text-xs text-muted mt-0.5">avg rating</p>
        </div>
        <div className="h-10 w-px bg-border-strong" />
        <div>
          <p className="text-lg font-bold text-ink">{reviews.length} reviews</p>
          <p className="text-xs text-muted">{reviews.filter(r=>r.verified).length} verified</p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map(review => (
          <div key={review.id} className="rounded-2xl border border-border bg-white">
            {editId === review.id ? (
              <div className="p-4 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><label className="label">Customer name</label><input value={editForm.authorName} onChange={e=>setEditForm(f=>({...f,authorName:e.target.value}))} className={iCls} /></div>
                  <div><label className="label">Date</label><input type="date" value={editForm.date} onChange={e=>setEditForm(f=>({...f,date:e.target.value}))} className={iCls} /></div>
                </div>
                <div><label className="label mb-1.5">Rating</label><StarPicker value={editForm.rating} onChange={v=>setEditForm(f=>({...f,rating:v}))} /></div>
                <div><label className="label">Review text</label><textarea value={editForm.text} onChange={e=>setEditForm(f=>({...f,text:e.target.value}))} rows={3} className={iCls+" resize-none"} /></div>
                <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                  <input type="checkbox" checked={editForm.verified} onChange={e=>setEditForm(f=>({...f,verified:e.target.checked}))} className="accent-brand-500" />
                  Mark as verified visit
                </label>
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button onClick={()=>saveEdit(review.id)} disabled={busy===review.id} className={btnPrimary}>{busy===review.id?"Saving…":"Save"}</button>
                  <button onClick={()=>setEditId(null)} className={btnSecondary}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-full bg-surface-2 flex items-center justify-center text-sm font-bold text-ink shrink-0">
                      {review.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-ink">{review.authorName}</p>
                        {review.verified && <span className="rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.5">✓ Verified</span>}
                        <span className="text-xs text-muted-2 capitalize">{review.source}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({length:5},(_,i)=><span key={i} className={`text-sm ${i<review.rating?"text-brand-500":"text-border-strong"}`}>★</span>)}
                        <span className="text-xs text-muted-2 ml-1">{new Date(review.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={()=>{setEditId(review.id);setEditForm({authorName:review.authorName,rating:review.rating,text:review.text,date:review.date,verified:review.verified});}} className="h-7 w-7 flex items-center justify-center rounded-full border border-border-strong text-muted hover:border-ink hover:text-ink transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5L10.5 3.5M1.5 9.5l.75-2.25L8.5 1.5l2 2-6.25 6.25L1.5 9.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={()=>deleteReview(review.id)} disabled={busy===review.id} className="h-7 w-7 flex items-center justify-center rounded-full border border-border-strong text-muted hover:border-red-200 hover:text-red-600 transition-colors">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-muted mt-3 leading-relaxed">{review.text}</p>
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && !adding && (
          <div className="rounded-2xl border border-dashed border-border-strong p-8 text-center text-sm text-muted">
            No reviews yet. Add your first review below.
          </div>
        )}
      </div>

      {/* Add review */}
      {adding ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 space-y-3">
          <p className="font-semibold text-ink text-sm">Add review</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><label className="label">Customer name *</label><input autoFocus value={form.authorName} onChange={e=>setForm(f=>({...f,authorName:e.target.value}))} placeholder="Ananya M." className={iCls} /></div>
            <div><label className="label">Date</label><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} className={iCls} /></div>
          </div>
          <div><label className="label mb-2">Rating</label><StarPicker value={form.rating} onChange={v=>setForm(f=>({...f,rating:v}))} /></div>
          <div><label className="label">Review text *</label><textarea value={form.text} onChange={e=>setForm(f=>({...f,text:e.target.value}))} rows={3} placeholder="Share what this customer said…" className={iCls+" resize-none"} /></div>
          <label className="flex items-center gap-2 text-sm text-ink cursor-pointer">
            <input type="checkbox" checked={form.verified} onChange={e=>setForm(f=>({...f,verified:e.target.checked}))} className="accent-brand-500" />
            Mark as verified visit
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={addReview} disabled={busy==="add"} className={btnPrimary}>{busy==="add"?"Adding…":"Add review"}</button>
            <button onClick={()=>{setAdding(false);setForm(EMPTY_REVIEW);setError(null);}} className={btnSecondary}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)} className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-brand-300 text-brand-500 text-lg font-bold leading-none">+</span>
          Add review
        </button>
      )}
    </div>
  );
}

// ─── Create storefront (first-time setup) ─────────────────────────────────────

function CreateStorefront({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ area: "", tagline: "", description: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (!form.area.trim()) { setError("Area / locality is required"); return; }
    setSaving(true); setError(null);
    try {
      await apiFetch("/api/v1/onboarding/storefront", { method: "POST", body: JSON.stringify(form) });
      onCreated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create storefront");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
          <SfStoreIcon className="h-7 w-7" />
        </div>
        <p className="eyebrow mb-1">Storefront</p>
        <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-ink">Create your storefront</h2>
        <p className="mt-2 text-sm text-muted">
          Start with your business profile. You&apos;ll add services, photos, and a description next —
          then activate to go live.
        </p>
      </div>

      <div className="space-y-5 rounded-3xl border border-border bg-white p-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Area / locality *</label>
            <input value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="Bandra West" className={iCls} />
          </div>
          <div>
            <label className="label">Phone</label>
            <div className="flex rounded-xl border border-border-strong bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/30">
              <span className="flex items-center px-3 text-sm text-muted border-r border-border-strong bg-surface-2 shrink-0">+91</span>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="98765 43210" className="flex-1 bg-transparent px-3 py-2.5 text-sm text-ink focus:outline-none" />
            </div>
          </div>
        </div>
        <div>
          <label className="label">Address</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Shop 4, Linking Road, Mumbai 400050" className={iCls} />
        </div>
        <div>
          <label className="label">Tagline <span className="text-muted-2 font-normal normal-case tracking-normal text-[11px]">({form.tagline.length}/160)</span></label>
          <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value.slice(0, 160) }))} placeholder="Your neighbourhood beauty destination" className={iCls} />
        </div>
        <div>
          <label className="label">About <span className="text-muted-2 font-normal normal-case tracking-normal text-[11px]">({form.description.length}/600)</span></label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value.slice(0, 600) }))} rows={4} placeholder="Tell customers about your salon…" className={iCls + " resize-none"} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={create} disabled={saving} className={btnPrimary + " w-full"}>
          {saving ? "Creating…" : "Create storefront →"}
        </button>
      </div>
    </div>
  );
}

// ─── Main StorefrontManager ───────────────────────────────────────────────────

type Tab = "overview" | "services" | "photos" | "reviews";

const TABS: { id: Tab; label: string; Icon: (p: { className?: string }) => React.ReactElement }[] = [
  { id: "overview",  label: "Profile",  Icon: SfStoreIcon },
  { id: "services",  label: "Services", Icon: SfScissorsIcon },
  { id: "photos",    label: "Photos",   Icon: SfPhotoIcon },
  { id: "reviews",   label: "Reviews",  Icon: SfStarIcon },
];

// Premium line icons for the storefront editor tabs
function SfStoreIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9.5 5.2 4h13.6L20 9.5M4 9.5h16M4 9.5v9.5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5M4 9.5a2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0 2.2 2.2 0 0 0 4 0" />
    </svg>
  );
}
function SfScissorsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="6" cy="6" r="2.6" /><circle cx="6" cy="18" r="2.6" /><path d="M8 8l12 8M8 16 20 8" />
    </svg>
  );
}
function SfPhotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" /><circle cx="8.5" cy="10" r="1.6" /><path d="m4 17 5-4 4 3 3-2.5 5 4" />
    </svg>
  );
}
function SfStarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m12 3.5 2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 17.8l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9z" />
    </svg>
  );
}

export function StorefrontManager() {
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<StorefrontData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/manage/storefront");
      setData(res.storefront);
      setNotFound(false);
    } catch (e) {
      // A missing storefront is an expected state — show the create flow, not an error.
      const msg = e instanceof Error ? e.message : "Failed to load storefront data";
      if (/not found/i.test(msg)) setNotFound(true);
      else setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function togglePublish() {
    if (!data) return;
    setPublishing(true); setPublishError(null);
    try {
      if (data.isPublished) {
        await apiFetch("/api/v1/manage/storefront", { method: "PATCH", body: JSON.stringify({ isPublished: false }) });
      } else {
        // Activate: requires at least one service (enforced server-side)
        await apiFetch("/api/v1/onboarding/storefront/publish", { method: "POST", body: JSON.stringify({}) });
      }
      await load();
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "Could not update storefront status");
    } finally {
      setPublishing(false);
    }
  }

  if (loading) return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 w-20 rounded-full bg-gray-200" />
          <div className="h-6 w-48 rounded-xl bg-gray-200" />
          <div className="h-4 w-32 rounded-full bg-gray-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded-full bg-gray-200" />
          <div className="h-8 w-32 rounded-full bg-gray-200" />
        </div>
      </div>
      <div className="flex gap-4 border-b border-gray-100 pb-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-8 w-20 rounded-full bg-gray-100" />)}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded-2xl bg-gray-100" />)}
      </div>
    </div>
  );

  if (notFound) return <CreateStorefront onCreated={load} />;

  if (error) return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
      <p className="text-sm text-red-700 font-medium">{error}</p>
    </div>
  );

  if (!data) return null;

  const storefrontUrl = `/${data.city}/${data.slug}`;
  const canPublish = data.tenant.services.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow mb-1">Storefront</p>
          <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-ink">
            {data.tenant.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${data.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${data.isPublished ? "bg-emerald-500" : "bg-amber-500"}`} />
              {data.isPublished ? "Live" : "Draft"}
            </span>
            <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 hover:underline font-mono truncate max-w-[200px] sm:max-w-none">
              glamify.in{storefrontUrl}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary + " text-xs"}>
            Preview →
          </a>
          <button onClick={togglePublish} disabled={publishing || (!data.isPublished && !canPublish)} className={btnPrimary + " text-xs"}>
            {publishing ? "…" : data.isPublished ? "Unpublish" : "Activate storefront"}
          </button>
        </div>
      </div>

      {/* Activation guidance */}
      {!data.isPublished && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {canPublish
            ? "Your storefront is a draft. Fill in your profile, photos, and services below, then click “Activate storefront” to go live."
            : "Add at least one service (Services tab) before you can activate your storefront."}
        </div>
      )}
      {publishError && <p className="mb-4 text-sm text-red-600">{publishError}</p>}

      {/* Tab bar */}
      <div className="flex border-b border-border mb-6 -mx-1 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors shrink-0 ${
              tab === t.id
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <t.Icon className="h-4 w-4" />
            {t.label}
            {t.id === "services" && (
              <span className="ml-1 rounded-full bg-surface-2 text-muted px-1.5 py-0.5 text-[10px] font-semibold">
                {data.tenant.services.length}
              </span>
            )}
            {t.id === "photos" && (
              <span className="ml-1 rounded-full bg-surface-2 text-muted px-1.5 py-0.5 text-[10px] font-semibold">
                {data.photos.length}
              </span>
            )}
            {t.id === "reviews" && (
              <span className="ml-1 rounded-full bg-surface-2 text-muted px-1.5 py-0.5 text-[10px] font-semibold">
                {data.reviews.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && <TabOverview data={data} onSaved={load} />}
      {tab === "services" && <TabServices services={data.tenant.services} onChanged={load} />}
      {tab === "photos"   && <TabPhotos photos={data.photos} storefrontName={data.tenant.name} onChanged={load} />}
      {tab === "reviews"  && <TabReviews reviews={data.reviews} onChanged={load} />}
    </div>
  );
}
