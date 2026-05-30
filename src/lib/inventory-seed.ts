export type SupplierId = "sup-01" | "sup-02" | "sup-03" | "sup-04";

export type Supplier = {
  id: SupplierId;
  name: string;
  contact: string;
  leadTimeDays: number;
};

export const suppliers: Supplier[] = [
  { id: "sup-01", name: "Bombay Beauty Distributors", contact: "+91 22 4001 2233", leadTimeDays: 2 },
  { id: "sup-02", name: "Olaplex India", contact: "+91 22 6789 0011", leadTimeDays: 5 },
  { id: "sup-03", name: "Salon Supplies Hub", contact: "+91 80 4111 9988", leadTimeDays: 3 },
  { id: "sup-04", name: "Naturals Procure", contact: "+91 11 4555 3322", leadTimeDays: 4 },
];

export type StockCategory = "Hair color" | "Aftercare" | "Skincare" | "Nails" | "Tools" | "Retail";

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: StockCategory;
  costPrice: number;
  retailPrice: number;
  unit: "unit" | "ml" | "g";
  currentStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  supplierId: SupplierId;
  expiryTracked: boolean;
  nearestExpiry?: string;
  daysToExpiry?: number;
  lastReceived: string;
  consumedThisMonth: number;
};

export const inventoryItems: InventoryItem[] = [
  {
    id: "inv-01",
    sku: "PL-DEV-30V",
    name: "Platinum Developer 30 Vol",
    brand: "Wella",
    category: "Hair color",
    costPrice: 480,
    retailPrice: 0,
    unit: "ml",
    currentStock: 1.2,
    reorderLevel: 4,
    reorderQuantity: 8,
    supplierId: "sup-01",
    expiryTracked: true,
    nearestExpiry: "2026-09-12",
    daysToExpiry: 106,
    lastReceived: "2026-05-04",
    consumedThisMonth: 6.4,
  },
  {
    id: "inv-02",
    sku: "OL-NO4-250",
    name: "Olaplex No.4 Bond Maintenance Shampoo 250ml",
    brand: "Olaplex",
    category: "Aftercare",
    costPrice: 1450,
    retailPrice: 2400,
    unit: "unit",
    currentStock: 7,
    reorderLevel: 6,
    reorderQuantity: 12,
    supplierId: "sup-02",
    expiryTracked: true,
    nearestExpiry: "2027-02-18",
    daysToExpiry: 265,
    lastReceived: "2026-05-12",
    consumedThisMonth: 8,
  },
  {
    id: "inv-03",
    sku: "OL-NO5-250",
    name: "Olaplex No.5 Bond Maintenance Conditioner 250ml",
    brand: "Olaplex",
    category: "Aftercare",
    costPrice: 1450,
    retailPrice: 2400,
    unit: "unit",
    currentStock: 3,
    reorderLevel: 6,
    reorderQuantity: 12,
    supplierId: "sup-02",
    expiryTracked: true,
    nearestExpiry: "2027-02-18",
    daysToExpiry: 265,
    lastReceived: "2026-05-12",
    consumedThisMonth: 9,
  },
  {
    id: "inv-04",
    sku: "LR-SR-50",
    name: "L'Oréal Pro Serie Expert Serum 50ml",
    brand: "L'Oréal",
    category: "Aftercare",
    costPrice: 620,
    retailPrice: 1100,
    unit: "unit",
    currentStock: 18,
    reorderLevel: 10,
    reorderQuantity: 24,
    supplierId: "sup-03",
    expiryTracked: true,
    nearestExpiry: "2026-12-04",
    daysToExpiry: 189,
    lastReceived: "2026-04-20",
    consumedThisMonth: 5,
  },
  {
    id: "inv-05",
    sku: "MK-FW-150",
    name: "Mamaearth Vitamin C Face Wash 150ml",
    brand: "Mamaearth",
    category: "Skincare",
    costPrice: 140,
    retailPrice: 250,
    unit: "unit",
    currentStock: 22,
    reorderLevel: 8,
    reorderQuantity: 24,
    supplierId: "sup-04",
    expiryTracked: true,
    nearestExpiry: "2027-04-30",
    daysToExpiry: 336,
    lastReceived: "2026-05-01",
    consumedThisMonth: 11,
  },
  {
    id: "inv-06",
    sku: "WL-COL-BR",
    name: "Wella Koleston Perfect — Brown 50ml",
    brand: "Wella",
    category: "Hair color",
    costPrice: 320,
    retailPrice: 0,
    unit: "unit",
    currentStock: 4,
    reorderLevel: 6,
    reorderQuantity: 18,
    supplierId: "sup-01",
    expiryTracked: true,
    nearestExpiry: "2026-08-22",
    daysToExpiry: 85,
    lastReceived: "2026-04-28",
    consumedThisMonth: 14,
  },
  {
    id: "inv-07",
    sku: "OPI-LK-RED",
    name: "OPI Nail Lacquer · Big Apple Red 15ml",
    brand: "OPI",
    category: "Nails",
    costPrice: 380,
    retailPrice: 0,
    unit: "unit",
    currentStock: 9,
    reorderLevel: 4,
    reorderQuantity: 12,
    supplierId: "sup-03",
    expiryTracked: false,
    lastReceived: "2026-04-14",
    consumedThisMonth: 3,
  },
  {
    id: "inv-08",
    sku: "FOIL-200",
    name: "Aluminium Foil Sheets · Pack of 200",
    brand: "SalonPro",
    category: "Tools",
    costPrice: 180,
    retailPrice: 0,
    unit: "unit",
    currentStock: 12,
    reorderLevel: 4,
    reorderQuantity: 8,
    supplierId: "sup-03",
    expiryTracked: false,
    lastReceived: "2026-05-06",
    consumedThisMonth: 2,
  },
  {
    id: "inv-09",
    sku: "GLM-GFT-1000",
    name: "Glamify Gift Card · ₹1000",
    brand: "Glamify",
    category: "Retail",
    costPrice: 0,
    retailPrice: 1000,
    unit: "unit",
    currentStock: 80,
    reorderLevel: 20,
    reorderQuantity: 100,
    supplierId: "sup-04",
    expiryTracked: false,
    lastReceived: "2026-04-02",
    consumedThisMonth: 12,
  },
  {
    id: "inv-10",
    sku: "MOR-HM-100",
    name: "Moroccanoil Hair Mask 100ml",
    brand: "Moroccanoil",
    category: "Aftercare",
    costPrice: 1100,
    retailPrice: 1850,
    unit: "unit",
    currentStock: 5,
    reorderLevel: 4,
    reorderQuantity: 10,
    supplierId: "sup-02",
    expiryTracked: true,
    nearestExpiry: "2026-06-18",
    daysToExpiry: 21,
    lastReceived: "2026-03-28",
    consumedThisMonth: 4,
  },
];

export type StockMovement = {
  id: string;
  itemId: string;
  type: "purchase" | "consumption" | "adjustment" | "transfer" | "sale";
  quantity: number;
  staffName: string;
  reference: string;
  at: string;
};

export const stockMovements: StockMovement[] = [
  { id: "m-001", itemId: "inv-01", type: "consumption", quantity: -0.8, staffName: "Priya M.", reference: "INV-2026-4810 · Ananya S. color", at: "Today · 11:24 AM" },
  { id: "m-002", itemId: "inv-03", type: "sale", quantity: -1, staffName: "Front desk", reference: "INV-2026-4811 · Riya K. retail", at: "Today · 12:02 PM" },
  { id: "m-003", itemId: "inv-06", type: "consumption", quantity: -1, staffName: "Priya M.", reference: "INV-2026-4812 · Meera J. root touch-up", at: "Today · 12:48 PM" },
  { id: "m-004", itemId: "inv-04", type: "sale", quantity: -2, staffName: "Front desk", reference: "INV-2026-4813 · Deepika I.", at: "Today · 1:34 PM" },
  { id: "m-005", itemId: "inv-10", type: "consumption", quantity: -0.5, staffName: "Sneha I.", reference: "INV-2026-4814 · Aditi V. hair spa", at: "Today · 2:11 PM" },
  { id: "m-006", itemId: "inv-02", type: "sale", quantity: -1, staffName: "Front desk", reference: "INV-2026-4815", at: "Today · 3:05 PM" },
  { id: "m-007", itemId: "inv-09", type: "sale", quantity: -2, staffName: "Front desk", reference: "Gift card purchase · Tanvi R.", at: "Today · 3:42 PM" },
  { id: "m-008", itemId: "inv-05", type: "consumption", quantity: -1, staffName: "Sneha I.", reference: "Facial usage · client #c-007", at: "Today · 4:10 PM" },
  { id: "m-009", itemId: "inv-08", type: "purchase", quantity: 12, staffName: "Manager · Rahul K.", reference: "PO-2026-118 · SalonPro", at: "Yesterday · 4:30 PM" },
  { id: "m-010", itemId: "inv-04", type: "purchase", quantity: 24, staffName: "Manager · Rahul K.", reference: "PO-2026-117 · Salon Supplies Hub", at: "Yesterday · 11:15 AM" },
  { id: "m-011", itemId: "inv-07", type: "adjustment", quantity: -1, staffName: "Audit · Rahul K.", reference: "Damaged at storage check", at: "2 days ago · 10:02 AM" },
];

export type PurchaseOrder = {
  id: string;
  itemId: string;
  itemName: string;
  supplierId: SupplierId;
  quantity: number;
  unitCost: number;
  expectedAt: string;
  status: "draft" | "sent" | "received";
  raisedBy: string;
};

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po-118", itemId: "inv-08", itemName: "Aluminium Foil Sheets · Pack of 200", supplierId: "sup-03", quantity: 12, unitCost: 180, expectedAt: "Delivered yesterday", status: "received", raisedBy: "Rahul K." },
  { id: "po-119", itemId: "inv-01", itemName: "Platinum Developer 30 Vol", supplierId: "sup-01", quantity: 8, unitCost: 480, expectedAt: "Expected tomorrow", status: "sent", raisedBy: "Rahul K." },
  { id: "po-120", itemId: "inv-03", itemName: "Olaplex No.5 Conditioner 250ml", supplierId: "sup-02", quantity: 12, unitCost: 1450, expectedAt: "Expected in 5 days", status: "sent", raisedBy: "Rahul K." },
];

export function findInventoryItem(id: string): InventoryItem | undefined {
  return inventoryItems.find((i) => i.id === id);
}

export function findSupplier(id: SupplierId): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function stockBadge(item: InventoryItem): "ok" | "low" | "critical" | "expiry" {
  if (item.expiryTracked && typeof item.daysToExpiry === "number" && item.daysToExpiry <= 30) {
    return "expiry";
  }
  if (item.currentStock <= item.reorderLevel * 0.5) return "critical";
  if (item.currentStock <= item.reorderLevel) return "low";
  return "ok";
}
