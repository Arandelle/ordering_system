import assert from "node:assert/strict";
import test, { describe } from "node:test";

import {
  calculateDeliveryFee,
  calculateDeliveryFeeFromCoordinates,
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
