// Storefront pages use a clean layout — no marketing Navbar or Footer.
// They have their own header built into StorefrontPage.

export default function StorefrontCityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
