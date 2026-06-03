import { redirect } from "next/navigation";

// /business is the authenticated area; canonical dashboard lives at /business/dashboard.
export default function BusinessIndexPage() {
  redirect("/business/dashboard");
}
