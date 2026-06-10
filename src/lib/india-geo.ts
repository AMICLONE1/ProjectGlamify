// City → state mapping for Indian local SEO.
//
// Used by storefront pages to emit correct schema.org PostalAddress
// (addressLocality = city, addressRegion = state) and classic geo meta tags
// (geo.region = ISO 3166-2 code, e.g. "IN-MH"). Slugs are lowercase as they
// appear in storefront URLs; lookup is tolerant of hyphens/spaces.

type StateInfo = { state: string; iso: string };

const STATES = {
  MH: { state: "Maharashtra", iso: "IN-MH" },
  KA: { state: "Karnataka", iso: "IN-KA" },
  DL: { state: "Delhi", iso: "IN-DL" },
  TG: { state: "Telangana", iso: "IN-TG" },
  TN: { state: "Tamil Nadu", iso: "IN-TN" },
  WB: { state: "West Bengal", iso: "IN-WB" },
  GJ: { state: "Gujarat", iso: "IN-GJ" },
  RJ: { state: "Rajasthan", iso: "IN-RJ" },
  UP: { state: "Uttar Pradesh", iso: "IN-UP" },
  HR: { state: "Haryana", iso: "IN-HR" },
  PB: { state: "Punjab", iso: "IN-PB" },
  MP: { state: "Madhya Pradesh", iso: "IN-MP" },
  KL: { state: "Kerala", iso: "IN-KL" },
  AP: { state: "Andhra Pradesh", iso: "IN-AP" },
  BR: { state: "Bihar", iso: "IN-BR" },
  OR: { state: "Odisha", iso: "IN-OR" },
  AS: { state: "Assam", iso: "IN-AS" },
  JH: { state: "Jharkhand", iso: "IN-JH" },
  CT: { state: "Chhattisgarh", iso: "IN-CT" },
  UT: { state: "Uttarakhand", iso: "IN-UT" },
  GA: { state: "Goa", iso: "IN-GA" },
  CH: { state: "Chandigarh", iso: "IN-CH" },
  JK: { state: "Jammu and Kashmir", iso: "IN-JK" },
  HP: { state: "Himachal Pradesh", iso: "IN-HP" },
} satisfies Record<string, StateInfo>;

const CITY_STATE: Record<string, StateInfo> = {
  // Maharashtra
  mumbai: STATES.MH, "navi mumbai": STATES.MH, thane: STATES.MH, pune: STATES.MH,
  nagpur: STATES.MH, nashik: STATES.MH, aurangabad: STATES.MH, solapur: STATES.MH,
  kolhapur: STATES.MH, amravati: STATES.MH,
  // Karnataka
  bengaluru: STATES.KA, bangalore: STATES.KA, mysuru: STATES.KA, mysore: STATES.KA,
  mangaluru: STATES.KA, mangalore: STATES.KA, hubli: STATES.KA, belgaum: STATES.KA,
  // Delhi NCR
  delhi: STATES.DL, "new delhi": STATES.DL,
  // Telangana
  hyderabad: STATES.TG, warangal: STATES.TG, secunderabad: STATES.TG,
  // Tamil Nadu
  chennai: STATES.TN, coimbatore: STATES.TN, madurai: STATES.TN, salem: STATES.TN,
  tiruchirappalli: STATES.TN, trichy: STATES.TN,
  // West Bengal
  kolkata: STATES.WB, howrah: STATES.WB, durgapur: STATES.WB, siliguri: STATES.WB,
  // Gujarat
  ahmedabad: STATES.GJ, surat: STATES.GJ, vadodara: STATES.GJ, rajkot: STATES.GJ,
  gandhinagar: STATES.GJ,
  // Rajasthan
  jaipur: STATES.RJ, jodhpur: STATES.RJ, udaipur: STATES.RJ, kota: STATES.RJ,
  // Uttar Pradesh
  lucknow: STATES.UP, kanpur: STATES.UP, noida: STATES.UP, "greater noida": STATES.UP,
  ghaziabad: STATES.UP, agra: STATES.UP, varanasi: STATES.UP, prayagraj: STATES.UP,
  // Haryana
  gurgaon: STATES.HR, gurugram: STATES.HR, faridabad: STATES.HR, panipat: STATES.HR,
  // Punjab
  ludhiana: STATES.PB, amritsar: STATES.PB, jalandhar: STATES.PB, patiala: STATES.PB,
  mohali: STATES.PB,
  // Madhya Pradesh
  indore: STATES.MP, bhopal: STATES.MP, gwalior: STATES.MP, jabalpur: STATES.MP,
  // Kerala
  kochi: STATES.KL, cochin: STATES.KL, thiruvananthapuram: STATES.KL, trivandrum: STATES.KL,
  kozhikode: STATES.KL, calicut: STATES.KL, thrissur: STATES.KL,
  // Andhra Pradesh
  visakhapatnam: STATES.AP, vizag: STATES.AP, vijayawada: STATES.AP, tirupati: STATES.AP,
  // Others
  patna: STATES.BR, bhubaneswar: STATES.OR, cuttack: STATES.OR, guwahati: STATES.AS,
  ranchi: STATES.JH, jamshedpur: STATES.JH, raipur: STATES.CT, dehradun: STATES.UT,
  panaji: STATES.GA, margao: STATES.GA, chandigarh: STATES.CH, srinagar: STATES.JK,
  jammu: STATES.JK, shimla: STATES.HP,
};

/** Look up the Indian state for a city slug ("navi-mumbai", "Pune", …). */
export function stateForCity(citySlug: string): StateInfo | null {
  const key = citySlug.toLowerCase().replace(/-/g, " ").trim();
  return CITY_STATE[key] ?? null;
}

/** "navi-mumbai" → "Navi Mumbai" */
export function titleCaseSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
