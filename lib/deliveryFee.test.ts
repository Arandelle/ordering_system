import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateDeliveryFee,
  estimateDeliveryFee,
} from "./deliveryFee";

test("calculates base fare plus first-tier and excess distance rates", () => {
  assert.deepEqual(calculateDeliveryFee(0), {
    distanceKm: 0,
    billableKm: 0,
    deliveryFee: 49,
  });

  assert.deepEqual(calculateDeliveryFee(0.1), {
    distanceKm: 0.1,
    billableKm: 1,
    deliveryFee: 59,
  });

  assert.deepEqual(calculateDeliveryFee(5), {
    distanceKm: 5,
    billableKm: 5,
    deliveryFee: 99,
  });

  assert.deepEqual(calculateDeliveryFee(6), {
    distanceKm: 6,
    billableKm: 6,
    deliveryFee: 107,
  });

  assert.deepEqual(calculateDeliveryFee(8.3), {
    distanceKm: 8.3,
    billableKm: 9,
    deliveryFee: 131,
  });
});

test("returns a rounded display distance from branch GeoJSON coordinates to delivery pin", () => {
  const estimate = estimateDeliveryFee(
    [120.9842, 14.5995],
    { lat: 14.6095, lng: 120.9842 },
  );

  assert.equal(estimate.distanceKm, 1.11);
});
