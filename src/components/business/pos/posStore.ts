"use client";

import { create } from "zustand";

export type CartItem = {
  key: string;
  kind: "service" | "product";
  id: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  staffId?: string;
  openPrice?: boolean;        // service has a "from"/range price → staff sets final amount
  priceMin?: number;          // base/min for validation hint
  priceMax?: number;          // upper bound for validation hint
};

export type PaymentMethod = "cash" | "upi" | "card";

export type Payment = {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
};

type PosState = {
  clientId: string | null;
  items: CartItem[];
  discountPercent: number;
  tip: number;
  payments: Payment[];
  notes: string;
};

export type CartProduct = { id: string; name: string; retailPrice: number; taxRate: number };
export type CartService = {
  id: string; name: string; price: number; taxRate: number;
  priceType?: "fixed" | "from" | "range" | null; priceMax?: number | null;
};

type PosActions = {
  setClient: (id: string | null) => void;
  addService: (service: CartService) => void;
  addProduct: (product: CartProduct) => void;
  updateQuantity: (key: string, delta: number) => void;
  updatePrice: (key: string, unitPrice: number) => void;
  removeItem: (key: string) => void;
  setDiscountPercent: (value: number) => void;
  setTip: (value: number) => void;
  addPayment: (payment: Omit<Payment, "id">) => void;
  removePayment: (id: string) => void;
  setNotes: (value: string) => void;
  reset: () => void;
};

const initialState: PosState = {
  clientId: null,
  items: [],
  discountPercent: 0,
  tip: 0,
  payments: [],
  notes: "",
};

let nextKey = 1;
function makeKey() {
  return `i-${Date.now().toString(36)}-${(nextKey++).toString(36)}`;
}

export const usePosStore = create<PosState & PosActions>((set) => ({
  ...initialState,

  setClient: (id) => set({ clientId: id }),

  addService: (service) =>
    set((state) => {
      const existing = state.items.find(
        (it) => it.kind === "service" && it.id === service.id
      );
      if (existing) {
        return {
          items: state.items.map((it) =>
            it === existing ? { ...it, quantity: it.quantity + 1 } : it
          ),
        };
      }
      const openPrice = service.priceType === "from" || service.priceType === "range";
      return {
        items: [
          ...state.items,
          {
            key: makeKey(),
            kind: "service",
            id: service.id,
            name: service.name,
            unitPrice: Number(service.price) || 0,
            taxRate: Number(service.taxRate) || 0,
            quantity: 1,
            openPrice,
            priceMin: Number(service.price) || 0,
            priceMax: service.priceMax != null ? Number(service.priceMax) : undefined,
          },
        ],
      };
    }),

  addProduct: (product) =>
    set((state) => {
      const existing = state.items.find(
        (it) => it.kind === "product" && it.id === product.id
      );
      if (existing) {
        return {
          items: state.items.map((it) =>
            it === existing ? { ...it, quantity: it.quantity + 1 } : it
          ),
        };
      }
      return {
        items: [
          ...state.items,
          {
            key: makeKey(),
            kind: "product",
            id: product.id,
            name: product.name,
            unitPrice: Number(product.retailPrice) || 0,
            taxRate: Number(product.taxRate) || 0,
            quantity: 1,
          },
        ],
      };
    }),

  updateQuantity: (key, delta) =>
    set((state) => ({
      items: state.items
        .map((it) => (it.key === key ? { ...it, quantity: it.quantity + delta } : it))
        .filter((it) => it.quantity > 0),
    })),

  updatePrice: (key, unitPrice) =>
    set((state) => ({
      items: state.items.map((it) =>
        it.key === key ? { ...it, unitPrice: Math.max(0, Number(unitPrice) || 0) } : it
      ),
    })),

  removeItem: (key) => set((state) => ({ items: state.items.filter((it) => it.key !== key) })),

  setDiscountPercent: (value) =>
    set({ discountPercent: Math.max(0, Math.min(100, value)) }),

  setTip: (value) => set({ tip: Math.max(0, value) }),

  addPayment: (payment) =>
    set((state) => ({
      payments: [...state.payments, { ...payment, id: `p-${Date.now().toString(36)}` }],
    })),

  removePayment: (id) =>
    set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

  setNotes: (value) => set({ notes: value }),

  reset: () =>
    set({
      clientId: null,
      items: [],
      discountPercent: 0,
      tip: 0,
      payments: [],
      notes: "",
    }),
}));

export type CartTotals = {
  subtotal: number;
  discountAmount: number;
  taxableBase: number;
  cgst: number;
  sgst: number;
  totalTax: number;
  tip: number;
  grandTotal: number;
  paid: number;
  due: number;
};

export function calculateTotals(
  items: CartItem[],
  discountPercent: number,
  tip: number,
  payments: Payment[]
): CartTotals {
  const subtotal = items.reduce((sum, it) => sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0), 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableBase = Math.max(0, subtotal - discountAmount);

  let totalTax = 0;
  for (const it of items) {
    const linePostDiscount =
      (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0) * (1 - discountPercent / 100);
    totalTax += (linePostDiscount * (Number(it.taxRate) || 0)) / 100;
  }

  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const grandTotal = taxableBase + totalTax + tip;
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  const due = grandTotal - paid;

  return {
    subtotal,
    discountAmount,
    taxableBase,
    cgst,
    sgst,
    totalTax,
    tip,
    grandTotal,
    paid,
    due,
  };
}

