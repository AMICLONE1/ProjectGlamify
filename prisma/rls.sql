-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security lockdown for Clitell
--
-- WHY: Supabase auto-exposes a REST Data API. The anon key is public (it ships in
-- the browser). With RLS disabled, anyone holding that key can read/write every
-- table directly, bypassing the app's API routes and auth.
--
-- MODEL: This app NEVER queries Supabase from the browser for data — the browser
-- client is used only for auth. All data access happens in server routes using the
-- SERVICE ROLE key, which BYPASSES RLS. Therefore we enable RLS with NO permissive
-- policies: the anon/authenticated roles get ZERO direct access, while the server
-- (service role) keeps full access. Result: the public Data API is locked, and the
-- application keeps working unchanged.
--
-- Safe to run multiple times (idempotent — ENABLE is a no-op if already enabled).
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.appointment_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.online_bookings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_details         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_photos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storefronts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;

-- Belt-and-suspenders: also FORCE RLS so even the table owner is subject to it.
-- (The service_role connection still bypasses RLS via its BYPASSRLS attribute.)
ALTER TABLE public.appointment_items     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.appointments          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.clients               FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.invoices              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.leads                 FORCE ROW LEVEL SECURITY;
ALTER TABLE public.locations             FORCE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_transactions  FORCE ROW LEVEL SECURITY;
ALTER TABLE public.online_bookings       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.products              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.services              FORCE ROW LEVEL SECURITY;
ALTER TABLE public.staff_details         FORCE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements       FORCE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_photos     FORCE ROW LEVEL SECURITY;
ALTER TABLE public.storefront_reviews    FORCE ROW LEVEL SECURITY;
ALTER TABLE public.storefronts           FORCE ROW LEVEL SECURITY;
ALTER TABLE public.tenants               FORCE ROW LEVEL SECURITY;
ALTER TABLE public.users                 FORCE ROW LEVEL SECURITY;

-- Defensive: ensure the anon and authenticated roles hold no table privileges
-- granted by Supabase defaults. RLS already blocks row access, this removes the
-- grant entirely so even metadata operations are denied.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
