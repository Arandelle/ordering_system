import assert from "node:assert/strict";
import test, { describe } from "node:test";

import {
  resolveCheckoutFulfillment,
  validateFulfillmentPayload,
} from "./checkoutFulfillment.service";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";
import { CITY_RESTRICTION_MESSAGE } from "@/lib/deliveryArea";

// Makati coordinates — inside polygon AND in allowed cities
const deliveryAddress = {
  line1: "123 Test Street",
  line2: "Barangay 1",
  city: "Makati",
  province: "Metro Manila",
  zipCode: "1210",
  country: "Philippines" as const,
  coordinates: { lat: 14.5547, lng: 121.0244 },
};

// Pasig coordinates — inside polygon but NOT in allowed cities
const restrictedCityAddress = {
  line1: "456 Ortigas Ave",
  line2: "Barangay 2",
  city: "Pasig",
  province: "Metro Manila",
  zipCode: "1600",
  country: "Philippines" as const,
  coordinates: { lat: 14.58, lng: 121.05 },
};

describe("Checkout Fulfillment", () => {
  test("pickup checkout does not require shipping address and returns zero delivery fee", () => {
    validateFulfillmentPayload({
      fulfillmentType: FULFILLMENT_TYPE.PICKUP,
      shippingAddress: undefined,
    });

    assert.deepEqual(
      resolveCheckoutFulfillment({
        fulfillmentType: FULFILLMENT_TYPE.PICKUP,
        branch: { location: { coordinates: [120.9842, 14.5995] } },
        shippingAddress: undefined,
      }),
      {
        fulfillmentType: FULFILLMENT_TYPE.PICKUP,
        shippingAddress: undefined,
        deliveryFee: 0,
        distanceKm: 0,
        billableKm: 0,
      },
    );
  });

  test("delivery checkout requires a delivery pin", () => {
    assert.throws(
      () =>
        validateFulfillmentPayload({
          fulfillmentType: FULFILLMENT_TYPE.DELIVERY,
          shippingAddress: { ...deliveryAddress, coordinates: undefined },
        }),
      /Pin your delivery location on the map/,
    );
  });

  test("delivery checkout rejects address outside the polygon", () => {
    assert.throws(
      () =>
        validateFulfillmentPayload({
          fulfillmentType: FULFILLMENT_TYPE.DELIVERY,
          shippingAddress: {
            ...deliveryAddress,
            coordinates: { lat: 14.67, lng: 121.04 },
          },
        }),
      /only available within the Makati/,
    );
  });

  test("delivery checkout rejects address in polygon but not in allowed cities", () => {
    assert.throws(
      () =>
        validateFulfillmentPayload({
          fulfillmentType: FULFILLMENT_TYPE.DELIVERY,
          shippingAddress: restrictedCityAddress,
        }),
      new RegExp(CITY_RESTRICTION_MESSAGE),
    );
  });

  test("delivery checkout accepts address in polygon AND in allowed cities", () => {
    // Should not throw — Makati is in both polygon and allowed cities
    validateFulfillmentPayload({
      fulfillmentType: FULFILLMENT_TYPE.DELIVERY,
      shippingAddress: deliveryAddress,
    });
  });
});
