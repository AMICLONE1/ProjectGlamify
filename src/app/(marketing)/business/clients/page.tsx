import type { Metadata } from "next";
import { ClientsBoard } from "@/components/business/clients/ClientsBoard";

export const metadata: Metadata = {
  title: "Clients — Clitell Business",
  description: "Search, segment, and care for every client across all visits.",
};

export default function BusinessClientsPage() {
  return <ClientsBoard />;
}
