/** Single source of truth for products, prices, units and order calculations. */
export const DENSITY_OPTIONS = [
  { value: 7, priceCents: 3200 },
  { value: 10, priceCents: 4000 },
  { value: 12, priceCents: 5000 },
  { value: 14, priceCents: 6200 },
  { value: 15, priceCents: 6700 },
  { value: 16, priceCents: 7100 },
  { value: 18, priceCents: 7900 },
  { value: 20, priceCents: 8700 },
] as const;

export const THICKNESS_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 40, 50, 60] as const;
export type Density = (typeof DENSITY_OPTIONS)[number]["value"];
export type Thickness = (typeof THICKNESS_OPTIONS)[number];
export type SheetProductId = "white" | "black";
export type ProductId = SheetProductId | "granules";

export interface Product {
  id: ProductId;
  number: string;
  name: string;
  description: string;
  image: string;
  imageAlt: string;
  kind: "sheet" | "granules";
}

export const PRODUCTS: readonly Product[] = [
  {
    id: "white",
    number: "01",
    name: "Oq penaplast",
    description: "Turli qurilish va issiqlik izolyatsiyasi ishlari uchun sifatli EPS penaplast.",
    image: "/images/product-white.jpg",
    imageAlt: "Oq EPS penaplast plitalari — materialning illustrativ vizuali",
    kind: "sheet",
  },
  {
    id: "black",
    number: "02",
    name: "Qora penaplast",
    description: "Qurilish va izolyatsiya ishlari uchun sifatli qora EPS penaplast.",
    image: "/images/product-black.jpg",
    imageAlt: "Grafit rangli qora EPS penaplast plitalari — illustrativ vizual",
    kind: "sheet",
  },
  {
    id: "granules",
    number: "03",
    name: "Maydalangan penaplast",
    description: "Qurilish va to‘ldirish ishlari uchun yengil, maydalangan EPS granulasi.",
    image: "/images/product-granules.jpg",
    imageAlt: "Maydalangan oq EPS penaplast granulalari — illustrativ vizual",
    kind: "granules",
  },
];

export const GRANULE_PRICE_CENTS = 70;
export const QUANTITY_LIMITS = {
  sheet: { min: 0.01, max: 10_000, step: 0.01, unit: "m³" },
  granules: { min: 1, max: 100_000, step: 1, unit: "kg" },
} as const;

export type ProductSelection =
  | { productId: SheetProductId; density: Density; thicknessCm: Thickness; quantity: string }
  | { productId: "granules"; quantity: string };

interface BaseQuote {
  productId: ProductId;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}
export interface SheetQuote extends BaseQuote {
  productId: SheetProductId;
  unit: "m³";
  density: Density;
  thicknessCm: Thickness;
}
export interface GranulesQuote extends BaseQuote {
  productId: "granules";
  unit: "kg";
}
export type Quote = SheetQuote | GranulesQuote;
export type SelectionErrors = Partial<Record<"productId" | "density" | "thicknessCm" | "quantity", string>>;

export function isProductId(value: unknown): value is ProductId {
  return PRODUCTS.some((product) => product.id === value);
}
export function isDensity(value: unknown): value is Density {
  return DENSITY_OPTIONS.some((option) => option.value === value);
}
export function isThickness(value: unknown): value is Thickness {
  return THICKNESS_OPTIONS.some((valueInList) => valueInList === value);
}
export function getProduct(id: ProductId): Product {
  const product = PRODUCTS.find((item) => item.id === id);
  if (!product) throw new Error("Unknown product");
  return product;
}
export function getDefaultSelection(productId: ProductId = "white"): ProductSelection {
  return productId === "granules"
    ? { productId, quantity: "10" }
    : { productId, density: 15, thicknessCm: 10, quantity: "1" };
}

/** Strict decimal parser: no exponents, Infinity, negative values or partial parses. */
export function parseQuantity(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(normalized)) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

export function validateSelection(selection: ProductSelection): SelectionErrors {
  const errors: SelectionErrors = {};
  if (!isProductId(selection.productId)) {
    return { productId: "Mahsulotni tanlang." };
  }
  const product = getProduct(selection.productId);
  if (product.kind === "sheet") {
    if (selection.productId === "granules") return { productId: "Mahsulot turi mos emas." };
    if (!isDensity(selection.density)) errors.density = "Mavjud zichlikni tanlang.";
    if (!isThickness(selection.thicknessCm)) errors.thicknessCm = "Mavjud qalinlikni tanlang.";
  }
  const limits = QUANTITY_LIMITS[product.kind];
  const quantity = parseQuantity(selection.quantity);
  if (quantity === null || quantity < limits.min || quantity > limits.max) {
    errors.quantity = `${formatQuantity(limits.min)}–${formatQuantity(limits.max)} ${limits.unit} oralig‘ida kiriting.${product.kind === "granules" ? " Butun kg kiriting." : " Ko‘pi bilan 2 kasr xonasi."}`;
  } else if (product.kind === "granules" && !Number.isInteger(quantity)) {
    errors.quantity = "Miqdorni butun kg da kiriting.";
  }
  return errors;
}

/** Prices are recalculated from the catalog; client-supplied prices are never used. */
export function calculateQuote(selection: ProductSelection): Quote | null {
  if (Object.keys(validateSelection(selection)).length > 0) return null;
  const quantity = parseQuantity(selection.quantity)!;
  const product = getProduct(selection.productId);
  if (selection.productId === "granules") {
    return {
      productId: selection.productId,
      productName: product.name,
      quantity,
      unit: "kg",
      unitPriceCents: GRANULE_PRICE_CENTS,
      totalCents: quantity * GRANULE_PRICE_CENTS,
    };
  }
  const unitPriceCents = DENSITY_OPTIONS.find((option) => option.value === selection.density)!.priceCents;
  // Integer hundredths of m³ × integer cents avoids floating-point money drift.
  const totalCents = Math.round((Math.round(quantity * 100) * unitPriceCents) / 100);
  return {
    productId: selection.productId,
    productName: product.name,
    density: selection.density,
    thicknessCm: selection.thicknessCm,
    quantity,
    unit: "m³",
    unitPriceCents,
    totalCents,
  };
}

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
});
const quantityFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
export function formatMoney(cents: number): string {
  return moneyFormatter.format(cents / 100);
}
export function formatQuantity(quantity: number): string {
  return quantityFormatter.format(quantity);
}
export function formatSelectionSummary(quote: Quote): string {
  const amount = `${formatQuantity(quote.quantity)} ${quote.unit}`;
  return quote.productId === "granules"
    ? amount
    : `${quote.density} kg/m³ · ${quote.thicknessCm} cm · ${amount}`;
}
