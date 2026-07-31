import assert from "node:assert/strict";
import test, { describe } from "node:test";

import {
  calculateDeliveryFee,
  calculateDeliveryFeeFromCoordinates,
  resolveEffectiveDeliveryFee,
  isFreeDeliveryEligible,
  FREE_DELIVERY_MINIMUM_PURCHASE,
  FREE_DELIVERY_MAX_DISTANCE_KM,
} from "./deliveryFee";

describe("Delivery Fee", () => {
  test("calculates base fare plus first-tier and excess distance rates", () => {
    assert.deepEqual(calculateDeliveryFee(0), {
      distanceKm: 0,
      billableKm: 0,
      deliveryFee: 65,
    });

    assert.deepEqual(calculateDeliveryFee(0.1), {
      distanceKm: 0.1,
      billableKm: 0,
      deliveryFee: 65,
    });

    assert.deepEqual(calculateDeliveryFee(5), {
      distanceKm: 5,
      billableKm: 5,
      deliveryFee: 115,
    });

    assert.deepEqual(calculateDeliveryFee(6), {
      distanceKm: 6,
      billableKm: 6,
      deliveryFee: 123,
    });

    assert.deepEqual(calculateDeliveryFee(8.3), {
      distanceKm: 8.3,
      billableKm: 8,
      deliveryFee: 139,
    });
  });

  test("returns a rounded display distance from branch GeoJSON coordinates to delivery pin", () => {
    const estimate = calculateDeliveryFeeFromCoordinates([120.9842, 14.5995], {
      lat: 14.6095,
      lng: 120.9842,
    });

    assert.equal(estimate.distanceKm, 1.11);
  });
});

describe("Free Delivery", () => {
  test("qualifies for free delivery when subtotal ≥ 549 and distance ≤ 5 km", () => {
    const result = resolveEffectiveDeliveryFee(3, 549);

    assert.equal(result.freeDeliveryEligible, true);
    assert.equal(result.effectiveDeliveryFee, 0);
    assert.equal(result.deliveryFee, 95); // base 65 + 3*10 = 95
    assert.equal(result.freeDeliveryReason, undefined);
  });

  test("qualifies for free delivery at exactly 549 subtotal and exactly 5 km", () => {
    const result = resolveEffectiveDeliveryFee(5, 549);

    assert.equal(result.freeDeliveryEligible, true);
    assert.equal(result.effectiveDeliveryFee, 0);
    assert.equal(result.deliveryFee, 115); // base 65 + 5*10 = 115
    assert.equal(result.freeDeliveryReason, undefined);
  });

  test("does NOT qualify for free delivery when subtotal < 549", () => {
    const result = resolveEffectiveDeliveryFee(3, 499);

    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, 95);
    assert.equal(result.deliveryFee, 95);
    assert.ok(result.freeDeliveryReason?.includes("₱50.00"));
  });

  test("does NOT qualify for free delivery when distance > 5 km, even if subtotal ≥ 549", () => {
    const result = resolveEffectiveDeliveryFee(6, 600);

    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, 123); // base 65 + 5*10 + 1*8 = 123
    assert.equal(result.deliveryFee, 123);
    assert.ok(result.freeDeliveryReason?.includes("within 5 km"));
  });

  test("does NOT qualify for free delivery when both subtotal < 549 and distance > 5 km", () => {
    const result = resolveEffectiveDeliveryFee(7, 300);

    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, 131); // base 65 + 5*10 + 2*8 = 131
    // Distance reason takes priority since it's the harder constraint
    assert.ok(result.freeDeliveryReason?.includes("within 5 km"));
  });

  test("shows amount-needed hint when subtotal is close to threshold but below it", () => {
    const result = resolveEffectiveDeliveryFee(2, 450);

    assert.equal(result.freeDeliveryEligible, false);
    const amountNeeded = FREE_DELIVERY_MINIMUM_PURCHASE - 450;
    assert.ok(result.freeDeliveryReason?.includes(`₱${amountNeeded.toFixed(2)}`));
  });

  test("no free delivery reason when distance is 0 (pickup scenario edge case)", () => {
    const result = resolveEffectiveDeliveryFee(0, 549);

    assert.equal(result.freeDeliveryReason, undefined);
  });
});

describe("isFreeDeliveryEligible", () => {
  test("returns true for delivery with subtotal ≥ 549 and distance ≤ 5 km", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 3, 549), true);
  });

  test("returns true at exactly 549 subtotal and exactly 5 km", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 5, 549), true);
  });

  test("returns false for pickup regardless of subtotal", () => {
    assert.equal(isFreeDeliveryEligible("pickup", 3, 549), false);
  });

  test("returns false when subtotal < 549", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 3, 499), false);
  });

  test("returns false when distance > 5 km even if subtotal ≥ 549", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 6, 600), false);
  });

  test("returns false when both conditions fail", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 7, 300), false);
  });

  test("returns false at boundary distance slightly over 5 km", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 5.01, 549), false);
  });
});
