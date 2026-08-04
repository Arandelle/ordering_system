import assert from "node:assert/strict";
import test, { describe } from "node:test";

import {
  calculateDeliveryFee,
  calculateDeliveryFeeFromCoordinates,
  resolveEffectiveDeliveryFee,
  isFreeDeliveryEligible,
  FREE_DELIVERY_MINIMUM_PURCHASE,
  FREE_DELIVERY_MAX_DISTANCE_KM,
  type FreeDeliveryConfig,
  type BranchDeliveryContext,
  type CustomerDeliveryContext,
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

describe("Barangay-based Free Delivery", () => {
  const enabledConfig: FreeDeliveryConfig = {
    freeDeliveryEnabled: true,
    freeDeliveryMinimumPurchase: 549,
    freeDeliveryMaxDistanceKm: 5,
  };

  // PSGC code for a specific barangay in Makati
  const branch: BranchDeliveryContext = {
    barangayCode: "137604020",
    deliveryRadiusKm: null,
  };

  test("same barangayCode grants free delivery even with low subtotal", () => {
    const result = resolveEffectiveDeliveryFee(
      3, 100, enabledConfig, branch, { barangayCode: "137604020" },
    );
    assert.equal(result.freeDeliveryEligible, true);
    assert.equal(result.effectiveDeliveryFee, 0);
  });

  test("same barangayCode grants free delivery even beyond max distance", () => {
    const result = resolveEffectiveDeliveryFee(
      10, 100, enabledConfig, branch, { barangayCode: "137604020" },
    );
    assert.equal(result.freeDeliveryEligible, true);
    assert.equal(result.effectiveDeliveryFee, 0);
  });

  test("different barangayCode does not match", () => {
    const result = resolveEffectiveDeliveryFee(
      3, 100, enabledConfig, branch, { barangayCode: "137604030" },
    );
    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, result.deliveryFee);
  });

  test("no match when branch barangayCode is empty", () => {
    const result = resolveEffectiveDeliveryFee(
      3, 100, enabledConfig, { barangayCode: "", deliveryRadiusKm: null }, { barangayCode: "137604020" },
    );
    assert.equal(result.freeDeliveryEligible, false);
  });

  test("no match when customer barangayCode is missing", () => {
    const result = resolveEffectiveDeliveryFee(
      3, 100, enabledConfig, branch, undefined,
    );
    assert.equal(result.freeDeliveryEligible, false);
  });

  test("no barangay match when free delivery is globally disabled", () => {
    const disabledConfig: FreeDeliveryConfig = {
      freeDeliveryEnabled: false,
      freeDeliveryMinimumPurchase: 549,
      freeDeliveryMaxDistanceKm: 5,
    };
    const result = resolveEffectiveDeliveryFee(
      3, 549, disabledConfig, branch, { barangayCode: "137604020" },
    );
    assert.equal(result.freeDeliveryEligible, false);
    assert.equal(result.effectiveDeliveryFee, result.deliveryFee);
  });
});

describe("isFreeDeliveryEligible with barangay match", () => {
  const enabledConfig: FreeDeliveryConfig = {
    freeDeliveryEnabled: true,
    freeDeliveryMinimumPurchase: 549,
    freeDeliveryMaxDistanceKm: 5,
  };
  const branch: BranchDeliveryContext = {
    barangayCode: "137604020",
    deliveryRadiusKm: null,
  };

  test("barangay match bypasses minimum purchase and distance", () => {
    assert.equal(
      isFreeDeliveryEligible("delivery", 10, 50, enabledConfig, branch, { barangayCode: "137604020" }),
      true,
    );
  });

  test("different barangayCode falls back to standard distance + minimum checks", () => {
    assert.equal(
      isFreeDeliveryEligible("delivery", 10, 50, enabledConfig, branch, { barangayCode: "137604030" }),
      false,
    );
  });

  test("missing customer barangayCode falls back to standard checks", () => {
    assert.equal(
      isFreeDeliveryEligible("delivery", 10, 50, enabledConfig, branch, undefined),
      false,
    );
  });

  test("globally disabled blocks even barangay match", () => {
    const disabledConfig: FreeDeliveryConfig = {
      freeDeliveryEnabled: false,
      freeDeliveryMinimumPurchase: 549,
      freeDeliveryMaxDistanceKm: 5,
    };
    assert.equal(
      isFreeDeliveryEligible("delivery", 1, 549, disabledConfig, branch, { barangayCode: "137604020" }),
      false,
    );
  });
});

describe("Branch deliveryRadiusKm override", () => {
  const enabledConfig: FreeDeliveryConfig = {
    freeDeliveryEnabled: true,
    freeDeliveryMinimumPurchase: 549,
    freeDeliveryMaxDistanceKm: 5,
  };

  test("branch radius extends free delivery range beyond global max", () => {
    const branch: BranchDeliveryContext = { barangayCode: "137604020", deliveryRadiusKm: 10 };
    // 7km is beyond global 5km but within branch 10km; different barangay so only distance+subtotal path
    const result = resolveEffectiveDeliveryFee(
      7, 549, enabledConfig, branch, { barangayCode: "137604030" },
    );
    assert.equal(result.freeDeliveryEligible, true);
    assert.equal(result.effectiveDeliveryFee, 0);
  });

  test("branch radius restricts free delivery range below global max", () => {
    const branch: BranchDeliveryContext = { barangayCode: "137604020", deliveryRadiusKm: 3 };
    // 4km is within global 5km but beyond branch 3km; different barangay so only distance+subtotal path
    const result = resolveEffectiveDeliveryFee(
      4, 549, enabledConfig, branch, { barangayCode: "137604030" },
    );
    assert.equal(result.freeDeliveryEligible, false);
  });
});
