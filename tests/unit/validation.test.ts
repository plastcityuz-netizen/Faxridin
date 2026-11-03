import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatPhone, normalizeUzPhone, parseOrderRequest, validateCustomer } from "../../src/lib/validation";

const customer = { name: "Ali", phone: "+998 90 123 45 67", address: "Toshkent, Chilonzor", note: "Ertaga yetkazib bering" };
const requestId = "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c4d5";
const payload = () => ({ selection: { productId: "white", density: 15, thicknessCm: 10, quantity: "20" }, customer, requestId });

describe("customer and server-boundary validation", () => {
  it("normalizes Uzbek formats without accepting malformed numbers", () => {
    for (const value of ["+998 90 123 45 67", "998901234567", "90 123 45 67", "+998 (90) 123-45-67"]) assert.equal(normalizeUzPhone(value), "+998901234567");
    for (const value of ["", "123", "+998 90 123 45 678", "+1 90 123 45 67", "abcdefghi", "+998 00 000 00 00", "+998-90-123-45-67 ext 2"]) assert.equal(normalizeUzPhone(value), null);
    assert.equal(formatPhone("901234567"), "+998 90 123 45 67");
  });
  it("requires name, phone and address; note is optional and bounded", () => {
    assert.deepEqual(validateCustomer(customer), {});
    assert.deepEqual(validateCustomer({ ...customer, note: "" }), {});
    assert.ok(validateCustomer({ ...customer, name: " " }).name);
    assert.ok(validateCustomer({ ...customer, name: "x" }).name);
    assert.ok(validateCustomer({ ...customer, address: "Tosh" }).address);
    assert.ok(validateCustomer({ ...customer, phone: "123" }).phone);
    assert.ok(validateCustomer({ ...customer, note: "x".repeat(1001) }).note);
    assert.ok(validateCustomer({ ...customer, name: "Ali\u0000" }).name);
    assert.deepEqual(validateCustomer({ ...customer, note: "Birinci qator\nIkkinchi qator" }), {});
  });
  it("recalculates the total on the server and ignores a submitted price", () => {
    const parsed = parseOrderRequest({ ...payload(), totalCents: 1, unitPriceCents: 1 });
    assert.ok(parsed.ok);
    assert.equal(parsed.value.quote.totalCents, 134000);
    assert.equal(parsed.value.customer.phone, "+998901234567");
    assert.equal(parsed.value.reference, "IZO-A1B2C3D4");
  });
  it("rejects malformed product specifications and customer data", () => {
    assert.equal(parseOrderRequest(null).ok, false);
    assert.equal(parseOrderRequest({ ...payload(), selection: { productId: "other", quantity: "1" } }).ok, false);
    assert.equal(parseOrderRequest({ ...payload(), selection: { productId: "white", density: 9, thicknessCm: 10, quantity: "1" } }).ok, false);
    assert.equal(parseOrderRequest({ ...payload(), selection: { productId: "black", density: 15, thicknessCm: 4, quantity: "1" } }).ok, false);
    assert.equal(parseOrderRequest({ ...payload(), customer: { ...customer, phone: "123" } }).ok, false);
    assert.equal(parseOrderRequest({ ...payload(), customer: { ...customer, name: 1 } }).ok, false);
    assert.equal(parseOrderRequest({ ...payload(), requestId: "not-a-uuid" }).ok, false);
  });
  it("accepts granules without requiring sheet dimensions", () => {
    const parsed = parseOrderRequest({ ...payload(), selection: { productId: "granules", quantity: "100" } });
    assert.ok(parsed.ok);
    assert.equal(parsed.value.quote.totalCents, 7000);
    assert.equal(parsed.value.quote.unit, "kg");
  });
});
