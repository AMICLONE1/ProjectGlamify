// Storefront pages: clean layout — no marketing Navbar, Footer, CustomCursor or SmoothScroll.
// Root layout (app/layout.tsx) provides html/body/fonts/globals.
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
