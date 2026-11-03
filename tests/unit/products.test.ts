import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { DENSITY_OPTIONS, THICKNESS_OPTIONS, PRODUCTS, calculateQuote, formatMoney, formatSelectionSummary, getDefaultSelection, parseQuantity, validateSelection, type ProductSelection, type SheetProductId } from "../../src/lib/products";

const expectedPrices: Record<number, number> = { 7: 3200, 10: 4000, 12: 5000, 14: 6200, 15: 6700, 16: 7100, 18: 7900, 20: 8700 };

describe("central product catalog", () => {
  it("contains exactly the three requested products", () => {
    assert.deepEqual(PRODUCTS.map((product) => product.id), ["white", "black", "granules"]);
    assert.equal(DENSITY_OPTIONS.length, 8);
    assert.equal(THICKNESS_OPTIONS.length, 11);
  });
  for (const productId of ["white", "black"] as SheetProductId[]) {
    for (const option of DENSITY_OPTIONS) {
      it(`${productId}: density ${option.value} costs $${expectedPrices[option.value]! / 100} per m³`, () => {
        const quote = calculateQuote({ productId, density: option.value, thicknessCm: 10, quantity: "1" });
        assert.ok(quote);
        assert.equal(quote.unitPriceCents, expectedPrices[option.value]);
        assert.equal(quote.totalCents, expectedPrices[option.value]);
        assert.equal(quote.unit, "m³");
      });
    }
    for (const thickness of THICKNESS_OPTIONS) {
      it(`${productId}: thickness ${thickness} is a specification, not an invented price multiplier`, () => {
        const quote = calculateQuote({ productId, density: 15, thicknessCm: thickness, quantity: "2" });
        assert.ok(quote);
        assert.ok(quote.productId !== "granules");
        assert.equal(quote.thicknessCm, thickness);
        assert.equal(quote.totalCents, 13_400);
      });
    }
  }
  it("calculates sheet volume totals in integer cents", () => {
    const quote = calculateQuote({ productId: "white", density: 15, thicknessCm: 10, quantity: "2.5" });
    assert.equal(quote?.totalCents, 16_750);
    assert.equal(calculateQuote({ productId: "black", density: 20, thicknessCm: 60, quantity: "0.01" })?.totalCents, 87);
    assert.equal(calculateQuote({ productId: "white", density: 7, thicknessCm: 1, quantity: "10000" })?.totalCents, 32_000_000);
  });
  for (const [quantity, total] of [[10, 700], [50, 3500], [100, 7000], [1, 70], [100000, 7_000_000]] as const) {
    it(`granules: ${quantity} kg × $0.70 = ${total} cents`, () => {
      const quote = calculateQuote({ productId: "granules", quantity: String(quantity) });
      assert.equal(quote?.unitPriceCents, 70);
      assert.equal(quote?.totalCents, total);
      assert.equal(quote?.unit, "kg");
    });
  }
  it("rejects invalid, non-finite, exponential, negative and out-of-range quantities", () => {
    for (const quantity of ["", "abc", "-1", "0", "Infinity", "NaN", "1e3", "1.234", "10000.01", "1,2,3"]) {
      assert.equal(calculateQuote({ productId: "white", density: 15, thicknessCm: 10, quantity }), null, quantity);
    }
    for (const quantity of ["0", "-1", "1.5", "100001", "1e3"]) assert.equal(calculateQuote({ productId: "granules", quantity }), null);
    assert.equal(parseQuantity(" 2,5 "), 2.5);
  });
  it("rejects tampered catalog variants and unknown products", () => {
    assert.equal(calculateQuote({ productId: "white", density: 9 as never, thicknessCm: 10, quantity: "1" }), null);
    assert.equal(calculateQuote({ productId: "black", density: 15, thicknessCm: 4 as never, quantity: "1" }), null);
    assert.equal(calculateQuote({ productId: "other" as never, quantity: "1" }), null);
    assert.ok(validateSelection({ productId: "other", quantity: "10" } as unknown as ProductSelection).productId);
  });
  it("formats prices and summaries consistently", () => {
    assert.equal(formatMoney(16750), "$167.50");
    assert.equal(formatMoney(7000), "$70.00");
    const quote = calculateQuote(getDefaultSelection("black"));
    assert.ok(quote);
    assert.equal(formatSelectionSummary(quote), "15 kg/m³ · 10 cm · 1 m³");
    assert.equal(formatSelectionSummary(calculateQuote(getDefaultSelection("granules"))!), "10 kg");
  });
});
