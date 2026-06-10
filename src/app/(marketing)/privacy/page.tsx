import type { Metadata } from "next";
import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Clitell collects, uses, shares, and protects personal data — in compliance with India's Digital Personal Data Protection Act, 2023.",
  alternates: { canonical: "/privacy" },
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    heading: "Introduction & scope",
    clauses: [
      { type: "p", text: "This Privacy Policy explains how Clitell (“Clitell”, “we”, “us”, or “our”) collects, uses, discloses, stores, and protects personal data when you access or use our website at clitell.in, the Clitell business platform, the Clitell consumer application, and any related services (together, the “Services”)." },
      { type: "p", text: "The Services are owned and operated by PowerNetPro Private Limited, a company incorporated under the Companies Act, 2013 (“the Company”), with its registered office at Kashyap 509, MITWPU TBI, Paud Rd, Rambaug Colony, Kothrud, Pune, Maharashtra 411038. References to “Clitell” in this Policy mean the Services and the operator of those Services." },
      { type: "p", text: "This Policy is published in accordance with the Information Technology Act, 2000, the rules made thereunder, and India's Digital Personal Data Protection Act, 2023 (“DPDPA”). By using the Services, you acknowledge that you have read and understood this Policy." },
    ],
  },
  {
    id: "roles",
    heading: "Our role: controller and processor",
    clauses: [
      { type: "p", text: "Clitell plays two distinct roles depending on whose data is being processed:" },
      { type: "sub", label: "As a Data Fiduciary (Controller).", text: "For data about our direct users — salon, spa, and clinic owners and their staff who hold a Clitell account — we determine the purposes and means of processing and act as the Data Fiduciary." },
      { type: "sub", label: "As a Data Processor.", text: "For data that a business (our customer) uploads about its own clients — such as customer names, phone numbers, appointment and billing history — the business is the Data Fiduciary and Clitell merely processes that data on the business's instructions to provide the Services. The business is responsible for having a lawful basis to collect and share that data with us." },
    ],
  },
  {
    id: "data-we-collect",
    heading: "Personal data we collect",
    clauses: [
      { type: "sub", label: "Account & identity data.", text: "Name, email address, mobile number, password (stored only as a salted hash), and business role." },
      { type: "sub", label: "Business data.", text: "Business name, address, locality, business type, GSTIN, operating hours, services, pricing, and storefront content you choose to publish." },
      { type: "sub", label: "Client data (processed on behalf of businesses).", text: "Customer names, contact numbers, visit history, appointment records, invoices, loyalty points, and notes that a business records about its clients." },
      { type: "sub", label: "Transaction & billing data.", text: "Invoices, amounts, GST breakdowns, and payment method used. Clitell currently does not process card payments and does not store card numbers, CVV, or banking credentials. Subscription fees are presently collected directly/offline." },
      { type: "sub", label: "Technical & usage data.", text: "IP address, device and browser type, pages and features used, and diagnostic logs, collected to operate, secure, and improve the Services." },
      { type: "p", text: "We do not knowingly collect sensitive personal data such as financial account numbers, biometric data, or health records beyond what a business voluntarily records about its own clients." },
    ],
  },
  {
    id: "purposes",
    heading: "How and why we use your data",
    clauses: [
      { type: "p", text: "We process personal data only for lawful, specified purposes, including:" },
      { type: "list", items: [
        "Creating and managing your account and providing the Services;",
        "Enabling bookings, billing, GST-compliant invoicing, client management, and inventory features;",
        "Sending transactional and service communications (booking confirmations, OTPs, receipts, reminders);",
        "Providing customer support and responding to your requests;",
        "Detecting, preventing, and investigating fraud, abuse, and security incidents;",
        "Improving, analysing, and developing new features; and",
        "Complying with applicable law and enforcing our Terms.",
      ] },
      { type: "p", text: "We do not sell your personal data. We do not use client data uploaded by businesses for advertising or to build profiles outside the scope of providing the Services." },
    ],
  },
  {
    id: "legal-basis",
    heading: "Lawful basis & consent",
    clauses: [
      { type: "p", text: "We process personal data on the basis of your consent and, where applicable, for the performance of our contract with you, to comply with legal obligations, and for legitimate uses permitted under the DPDPA. Where consent is the basis, you may withdraw it at any time, though doing so may limit your ability to use certain features." },
      { type: "p", text: "Businesses that upload client data confirm that they have obtained any consent required from their own clients before sharing such data with Clitell." },
    ],
  },
  {
    id: "sharing",
    heading: "Disclosure & sharing of data",
    clauses: [
      { type: "p", text: "We share personal data only as necessary and with appropriate safeguards:" },
      { type: "sub", label: "Service providers.", text: "Trusted vendors who help us run the Services — cloud hosting and database (Supabase), SMS/WhatsApp delivery (e.g. MSG91, Meta), and mapping/discovery (Google) — process data only on our instructions under confidentiality obligations." },
      { type: "sub", label: "Within the business's organisation.", text: "Client data is accessible to the authorised staff of the business that owns it." },
      { type: "sub", label: "Legal & safety.", text: "We may disclose data where required by law, court order, or to protect the rights, safety, and property of Clitell, our users, or the public." },
      { type: "sub", label: "Business transfers.", text: "If Clitell is involved in a merger, acquisition, or asset sale, data may be transferred subject to this Policy; we will notify you of any change in control." },
    ],
  },
  {
    id: "third-party",
    heading: "Third-party services & Google data",
    clauses: [
      { type: "p", text: "Storefronts may display a business's public Google rating and reviews via the Google Places API. This information is retrieved live from Google, shown with attribution, and is subject to Google's own terms and privacy policy. Links to Google or other third-party sites are governed by those parties' policies, not this one." },
    ],
  },
  {
    id: "retention",
    heading: "Data retention",
    clauses: [
      { type: "p", text: "We retain personal data only for as long as necessary to fulfil the purposes set out in this Policy:" },
      { type: "list", items: [
        "Active account data is retained for the duration of your subscription and for up to 90 days after account closure, to allow reactivation and data export;",
        "Financial and tax records (invoices, GST data) are retained for the period required under applicable Indian tax and accounting law (generally up to 8 years);",
        "Diagnostic logs are retained for a limited period for security and debugging.",
      ] },
      { type: "p", text: "After the applicable period, data is securely deleted or irreversibly anonymised." },
    ],
  },
  {
    id: "your-rights",
    heading: "Your rights as a Data Principal",
    clauses: [
      { type: "p", text: "Subject to the DPDPA and applicable law, you have the right to:" },
      { type: "list", items: [
        "Access a summary of the personal data we process about you and how it is processed;",
        "Correct, complete, or update inaccurate or incomplete personal data;",
        "Request erasure of your personal data, subject to legal retention requirements;",
        "Withdraw consent previously given;",
        "Nominate another individual to exercise your rights in the event of death or incapacity; and",
        "Grievance redressal through our Grievance Officer (see below).",
      ] },
      { type: "p", text: "Where Clitell acts as a Processor for client data, requests from a business's clients should be directed to that business, which is the Data Fiduciary; we will assist the business in responding as required." },
    ],
  },
  {
    id: "security",
    heading: "How we protect your data",
    clauses: [
      { type: "p", text: "We apply reasonable security safeguards appropriate to the sensitivity of the data, including encryption in transit (TLS), encryption of data at rest by our hosting provider, hashed passwords, scoped access controls so each business can only access its own data, rate limiting, and audit logging of sensitive actions." },
      { type: "p", text: "No method of transmission or storage is perfectly secure. In the event of a personal data breach that is likely to cause harm, we will notify the Data Protection Board of India and affected individuals as required by the DPDPA." },
    ],
  },
  {
    id: "children",
    heading: "Children's data",
    clauses: [
      { type: "p", text: "The Services are intended for businesses and adults. We do not knowingly process the personal data of children (individuals under 18) as Data Principals without verifiable parental consent. If you believe a child's data has been provided to us without appropriate consent, contact us and we will take steps to delete it." },
    ],
  },
  {
    id: "cookies",
    heading: "Cookies & local storage",
    clauses: [
      { type: "p", text: "We use cookies and browser storage (such as localStorage) for essential functions — keeping you signed in, remembering preferences, and maintaining security. We use minimal analytics to understand product usage. You can control cookies through your browser settings; disabling essential cookies may prevent the Services from working." },
    ],
  },
  {
    id: "transfers",
    heading: "Data location & international transfers",
    clauses: [
      { type: "p", text: "Personal data is primarily stored on servers located in or serving the India region. Where a service provider processes data outside India, we ensure such transfers comply with the DPDPA and are subject to appropriate contractual safeguards." },
    ],
  },
  {
    id: "changes",
    heading: "Changes to this Policy",
    clauses: [
      { type: "p", text: "We may update this Policy from time to time. For material changes, we will provide notice by email or an in-product notice at least 30 days before the changes take effect, unless an earlier change is required by law. The “Last updated” date reflects the current version. Continued use of the Services after the effective date constitutes acceptance." },
    ],
  },
  {
    id: "grievance",
    heading: "Grievance Officer & contact",
    clauses: [
      { type: "p", text: "In accordance with the DPDPA and the Information Technology Act, 2000, you may contact our Grievance Officer for any concern regarding your personal data or this Policy. We aim to acknowledge complaints within 48 hours and resolve them within the timelines prescribed by law." },
      { type: "sub", label: "Grievance Officer:", text: "[To be appointed upon incorporation]" },
      { type: "sub", label: "Email:", text: "info@powernetpro.com" },
      { type: "sub", label: "Operator:", text: "PowerNetPro Private Limited — Kashyap 509, MITWPU TBI, Paud Rd, Rambaug Colony, Kothrud, Pune, Maharashtra 411038." },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      badge="DPDPA-aligned"
      lastUpdated="June 7, 2026"
      intro="Your privacy matters to us. This Policy describes the personal data we handle, why we handle it, and the rights you have over it under Indian law."
      sections={sections}
      contactEmail="info@powernetpro.com"
      contactLabel="Questions about this Policy or your personal data?"
    />
  );
}
