import type { Metadata } from "next";
import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms and conditions under which you may access and use Clitell's products and services.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "agreement",
    heading: "Agreement to these Terms",
    clauses: [
      { type: "p", text: "These Terms of Service (“Terms”) form a binding agreement between you and Clitell (“Clitell”, “we”, “us”) governing your access to and use of the Clitell website, business platform, consumer application, and related services (the “Services”)." },
      { type: "p", text: "Clitell is a product in development. Upon incorporation, the Services will be operated by PowerNetPro Private Limited, proposed to be incorporated under the Companies Act, 2013. By creating an account, accessing, or using the Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, do not use the Services." },
      { type: "p", text: "If you accept these Terms on behalf of a business or other legal entity, you represent that you are authorised to bind that entity, and “you” refers to that entity." },
    ],
  },
  {
    id: "eligibility",
    heading: "Eligibility",
    clauses: [
      { type: "p", text: "You must be at least 18 years of age and capable of forming a binding contract under the Indian Contract Act, 1872, to use the Services. The Services are intended for use by businesses operating lawfully in India." },
    ],
  },
  {
    id: "accounts",
    heading: "Accounts & security",
    clauses: [
      { type: "p", text: "You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to provide accurate information and to keep it up to date." },
      { type: "p", text: "You must notify us immediately of any unauthorised use of your account or any other security breach at security@clitell.in. Clitell is not liable for any loss arising from your failure to safeguard your credentials." },
    ],
  },
  {
    id: "license",
    heading: "Licence to use the Services",
    clauses: [
      { type: "p", text: "Subject to these Terms, Clitell grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the Services for your internal business purposes. This licence does not include any right to resell, sublicense, or commercially exploit the Services except as expressly permitted." },
    ],
  },
  {
    id: "subscription",
    heading: "Plans, fees & billing",
    clauses: [
      { type: "sub", label: "Plans.", text: "The Services are offered on free and paid subscription plans. Plan features and prices are described on our pricing page and may change with notice." },
      { type: "sub", label: "Fees.", text: "Paid subscription fees are quoted in Indian Rupees (INR) and are exclusive of applicable taxes (including GST), which you are responsible for paying." },
      { type: "sub", label: "Collection.", text: "Subscription fees are currently collected directly/offline (for example, by bank transfer or UPI as arranged with you). Clitell does not currently process or store card or banking credentials. When automated billing is enabled in future, it will be handled by a PCI-DSS compliant payment gateway and these Terms will be updated accordingly." },
      { type: "sub", label: "Renewals & cancellation.", text: "Paid plans renew for the agreed period unless cancelled before the renewal date. Cancellation takes effect at the end of the current billing period. Except where required by law, fees already paid are non-refundable." },
      { type: "sub", label: "Non-payment.", text: "If fees are not paid when due, we may suspend or downgrade your account after reasonable notice." },
    ],
  },
  {
    id: "acceptable-use",
    heading: "Acceptable use",
    clauses: [
      { type: "p", text: "You agree not to, and not to permit others to:" },
      { type: "list", items: [
        "Use the Services for any unlawful, fraudulent, or harmful purpose;",
        "Upload content that is unlawful, infringing, defamatory, obscene, or that violates any third party's rights;",
        "Send unsolicited or unlawful communications (spam) through the Services;",
        "Submit, solicit, or generate fake, incentivised, or misleading reviews, including any attempt to manipulate ratings on Clitell or third-party platforms such as Google;",
        "Attempt to gain unauthorised access to the Services, other accounts, or our systems;",
        "Reverse-engineer, decompile, scrape, or copy the Services except as permitted by law; or",
        "Resell or provide the Services to third parties in competition with Clitell.",
      ] },
      { type: "p", text: "We may investigate and take appropriate action, including suspending or terminating accounts, for violations of this section." },
    ],
  },
  {
    id: "your-content",
    heading: "Your content & data",
    clauses: [
      { type: "p", text: "You retain all ownership rights in the business information, client data, photos, and other content you upload to the Services (“Your Content”). You grant Clitell a limited, worldwide, royalty-free licence to host, store, process, and display Your Content solely as necessary to provide and improve the Services." },
      { type: "p", text: "You are solely responsible for the accuracy and legality of Your Content and for having any consent required to collect and process the personal data of your own clients. You represent that you have all rights necessary to grant the above licence." },
    ],
  },
  {
    id: "ip",
    heading: "Intellectual property",
    clauses: [
      { type: "p", text: "The Services, including all software, design, text, graphics, logos, and the “Clitell” name and marks, are owned by Clitell / its operator and are protected by intellectual property laws. Except for the limited licence granted to you, no rights are transferred. You may not use our marks without our prior written permission." },
      { type: "p", text: "If you provide feedback or suggestions, you grant us a perpetual, royalty-free right to use them without obligation to you." },
    ],
  },
  {
    id: "availability",
    heading: "Service availability & support",
    clauses: [
      { type: "p", text: "We strive to keep the Services available and reliable but do not guarantee uninterrupted, error-free, or secure operation. We may perform maintenance, updates, or changes that temporarily affect availability." },
      { type: "p", text: "Formal uptime commitments (SLAs), if any, apply only where expressly agreed in writing for specific plans. We provide support through the channels described on our website." },
    ],
  },
  {
    id: "third-party",
    heading: "Third-party services",
    clauses: [
      { type: "p", text: "The Services may integrate with or link to third-party services (such as Google, messaging providers, and hosting). Your use of those services is governed by their own terms and policies. Clitell is not responsible for third-party services and disclaims liability for their availability, accuracy, or conduct." },
    ],
  },
  {
    id: "disclaimer",
    heading: "Disclaimer of warranties",
    clauses: [
      { type: "p", text: "To the maximum extent permitted by law, the Services are provided “as is” and “as available”, without warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement. We do not warrant that the Services will meet your requirements or that defects will be corrected." },
    ],
  },
  {
    id: "liability",
    heading: "Limitation of liability",
    clauses: [
      { type: "p", text: "To the maximum extent permitted by law, Clitell and its operator, directors, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for any loss of profits, revenue, data, goodwill, or business, arising out of or relating to your use of (or inability to use) the Services." },
      { type: "p", text: "Our total aggregate liability for any claim arising out of or relating to these Terms or the Services shall not exceed the total subscription fees actually paid by you to Clitell in the three (3) months immediately preceding the event giving rise to the claim, or ₹5,000, whichever is greater. Nothing in these Terms limits liability that cannot be excluded under applicable law." },
    ],
  },
  {
    id: "indemnity",
    heading: "Indemnity",
    clauses: [
      { type: "p", text: "You agree to indemnify and hold harmless Clitell and its operator from and against any claims, damages, liabilities, and reasonable expenses (including legal fees) arising out of your use of the Services, Your Content, your violation of these Terms, or your violation of any law or third-party right — including any failure to obtain required consent from your own clients." },
    ],
  },
  {
    id: "termination",
    heading: "Suspension & termination",
    clauses: [
      { type: "p", text: "You may stop using the Services and close your account at any time. We may suspend or terminate your access if you breach these Terms, fail to pay fees, or if required by law, generally after reasonable notice except where immediate action is needed to prevent harm." },
      { type: "p", text: "Upon termination, your right to use the Services ends. We will make Your Content available for export for up to 90 days, after which it may be permanently deleted, subject to legal retention requirements. Sections that by their nature should survive termination (including IP, disclaimers, liability, and indemnity) will survive." },
    ],
  },
  {
    id: "changes",
    heading: "Changes to the Services or Terms",
    clauses: [
      { type: "p", text: "We may modify the Services or these Terms from time to time. For material changes to the Terms, we will provide notice by email or in-product at least 30 days in advance, unless a shorter period is required by law. Continued use after the effective date constitutes acceptance of the revised Terms." },
    ],
  },
  {
    id: "governing-law",
    heading: "Governing law & dispute resolution",
    clauses: [
      { type: "p", text: "These Terms are governed by and construed in accordance with the laws of India. The parties will first attempt to resolve any dispute amicably through good-faith discussions." },
      { type: "p", text: "Failing resolution, disputes shall be referred to arbitration by a sole arbitrator under the Arbitration and Conciliation Act, 1996, seated in Pune, Maharashtra, conducted in English. Subject to arbitration, the courts at Pune, Maharashtra shall have exclusive jurisdiction. (Seat and venue will be confirmed against the operator's registered office upon incorporation.)" },
    ],
  },
  {
    id: "general",
    heading: "General",
    clauses: [
      { type: "sub", label: "Entire agreement.", text: "These Terms and the Privacy Policy constitute the entire agreement between you and Clitell regarding the Services." },
      { type: "sub", label: "Severability.", text: "If any provision is held unenforceable, the remaining provisions remain in full effect." },
      { type: "sub", label: "Waiver.", text: "Our failure to enforce any right is not a waiver of that right." },
      { type: "sub", label: "Assignment.", text: "You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets." },
      { type: "sub", label: "Contact.", text: "For questions about these Terms, email legal@clitell.in." },
      { type: "p", text: "Note: Clitell is a pre-incorporation product. Entity name, registered address, CIN, and statutory references will be finalised, and these Terms reviewed by legal counsel, before commercial launch." },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      lastUpdated="June 7, 2026"
      intro="These Terms govern your use of Clitell. Please read them carefully — they set out your rights and responsibilities, and ours."
      sections={sections}
      contactEmail="legal@clitell.in"
      contactLabel="Questions about these Terms?"
    />
  );
}
