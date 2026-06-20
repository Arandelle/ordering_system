import assert from "node:assert/strict";
import test from "node:test";

import {
  resolveCheckoutFulfillment,
  validateFulfillmentPayload,
} from "./checkoutFulfillment.service";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";

const deliveryAddress = {
  line1: "123 Test Street",
  line2: "Barangay 1",
  city: "Manila",
  province: "Metro Manila",
  zipCode: "1000",
  country: "Philippines" as const,
  coordinates: { lat: 14.5995, lng: 120.9842 },
};

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
