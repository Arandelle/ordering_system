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
      deliveryFee: 49,
    });

    assert.deepEqual(calculateDeliveryFee(0.1), {
      distanceKm: 0.1,
      billableKm: 0,
      deliveryFee: 49,
    });

    assert.deepEqual(calculateDeliveryFee(5), {
      distanceKm: 5,
      billableKm: 5,
      deliveryFee: 79,
    });

    assert.deepEqual(calculateDeliveryFee(6), {
      distanceKm: 6,
      billableKm: 6,
      deliveryFee: 84,
    });

    assert.deepEqual(calculateDeliveryFee(8.3), {
      distanceKm: 8.3,
      billableKm: 8,
      deliveryFee: 94,
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
  test("qualifies for free delivery when subtotal ≥ 500 and distance ≤ 5 km", () => {
    const result = resolveEffectiveDeliveryFee(3, 500);

    assert.equal(result.freeDeliveryEligible, true);
    assert.equal(result.effectiveDeliveryFee, 0);
    assert.equal(result.deliveryFee, 67); // base 49 + 3*6 = 67
    assert.equal(result.freeDeliveryReason, undefined);
  });

  test("qualifies for free delivery at exactly 500 subtotal and exactly 5 km", () => {
    const result = resolveEffectiveDeliveryFee(5, 500);

    assert.equal(result.freeDeliveryEligible, true);
    assert.equal(result.effectiveDeliveryFee, 0);
    assert.equal(result.deliveryFee, 79); // base 49 + 5*6 = 79
    assert.equal(result.freeDeliveryReason, undefined);
  });

  test("does NOT qualify for free delivery when subtotal < 500", () => {
    const result = resolveEffectiveDeliveryFee(3, 499);

    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, 67);
    assert.equal(result.deliveryFee, 67);
    assert.ok(result.freeDeliveryReason?.includes("₱1.00"));
  });

  test("does NOT qualify for free delivery when distance > 5 km, even if subtotal ≥ 500", () => {
    const result = resolveEffectiveDeliveryFee(6, 600);

    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, 84); // base 49 + 5*6 + 1*5 = 84
    assert.equal(result.deliveryFee, 84);
    assert.ok(result.freeDeliveryReason?.includes("within 5 km"));
  });

  test("does NOT qualify for free delivery when both subtotal < 500 and distance > 5 km", () => {
    const result = resolveEffectiveDeliveryFee(7, 300);

    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, 89); // base 49 + 5*6 + 2*5 = 89
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
    const result = resolveEffectiveDeliveryFee(0, 500);

    assert.equal(result.freeDeliveryReason, undefined);
  });
});

describe("isFreeDeliveryEligible", () => {
  test("returns true for delivery with subtotal ≥ 500 and distance ≤ 5 km", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 3, 500), true);
  });

  test("returns true at exactly 500 subtotal and exactly 5 km", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 5, 500), true);
  });

  test("returns false for pickup regardless of subtotal", () => {
    assert.equal(isFreeDeliveryEligible("pickup", 3, 500), false);
  });

  test("returns false when subtotal < 500", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 3, 499), false);
  });

  test("returns false when distance > 5 km even if subtotal ≥ 500", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 6, 600), false);
  });

  test("returns false when both conditions fail", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 7, 300), false);
  });

  test("returns false at boundary distance slightly over 5 km", () => {
    assert.equal(isFreeDeliveryEligible("delivery", 5.01, 500), false);
  });
});
