import assert from "node:assert/strict";
import test, { describe } from "node:test";

import {
  resolveCheckoutFulfillment,
  validateFulfillmentPayload,
} from "./checkoutFulfillment.service";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";
import { CITY_RESTRICTION_MESSAGE, type DeliveryAreaConfig } from "@/lib/deliveryArea";

// Makati coordinates — inside polygon AND in allowed cities
const deliveryAddress = {
  line1: "123 Test Street",
  line2: "Barangay 1",
  city: "Makati",
  cityCode: "137604000",
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
  cityCode: "137607000",
  province: "Metro Manila",
  zipCode: "1600",
  country: "Philippines" as const,
  coordinates: { lat: 14.58, lng: 121.05 },
};

// Admin-configured delivery areas — only Makati and Pasay
const deliveryAreas: DeliveryAreaConfig[] = [
  { cityCode: "137604000", cityName: "Makati" },
  { cityCode: "137605000", cityName: "Pasay" },
];

describe("Checkout Fulfillment", () => {
  test("pickup checkout requires a session for pickup time validation", async () => {
    // Without a session, pickup validation should reject
    await assert.rejects(
      () =>
        validateFulfillmentPayload({
          fulfillmentType: FULFILLMENT_TYPE.PICKUP,
          shippingAddress: undefined,
        }),
      /Session is required for pickup time validation/,
    );

    // resolveCheckoutFulfillment also requires a session for pickup
    await assert.rejects(
      () =>
        resolveCheckoutFulfillment({
          fulfillmentType: FULFILLMENT_TYPE.PICKUP,
          branch: { location: { coordinates: [120.9842, 14.5995] } },
          shippingAddress: undefined,
        }),
      /Session is required for pickup time validation/,
    );
  });

  test("delivery checkout requires a delivery pin", async () => {
    await assert.rejects(
      () =>
        validateFulfillmentPayload({
          fulfillmentType: FULFILLMENT_TYPE.DELIVERY,
          shippingAddress: { ...deliveryAddress, coordinates: undefined },
        }),
      /Pin your delivery location on the map/,
    );
  });

  test("delivery checkout rejects address outside the polygon", async () => {
    await assert.rejects(
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

  test("delivery checkout rejects address in polygon but not in configured delivery areas", async () => {
    await assert.rejects(
      () =>
        validateFulfillmentPayload(
          { fulfillmentType: FULFILLMENT_TYPE.DELIVERY, shippingAddress: restrictedCityAddress },
          undefined,
          deliveryAreas,
        ),
      new RegExp(CITY_RESTRICTION_MESSAGE),
    );
  });

  test("delivery checkout accepts address in polygon AND in configured delivery areas", async () => {
    // Should not throw — Makati cityCode is in the delivery areas
    await validateFulfillmentPayload(
      { fulfillmentType: FULFILLMENT_TYPE.DELIVERY, shippingAddress: deliveryAddress },
      undefined,
      deliveryAreas,
    );
  });

  test("delivery checkout allows all cities when deliveryAreas is empty", async () => {
    // Empty areas = no restriction — even Pasig should pass
    await validateFulfillmentPayload(
      { fulfillmentType: FULFILLMENT_TYPE.DELIVERY, shippingAddress: restrictedCityAddress },
      undefined,
      [],
    );
  });
});
