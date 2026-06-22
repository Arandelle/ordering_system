import assert from "node:assert/strict";
import test, { describe } from "node:test";

import { FULFILLMENT_TYPE } from "../../../types/orderConstants";
import { getCheckoutActionMode } from "./checkoutAction";

describe("Check out action", () => {
  test("pickup can place the order directly from the details step", () => {
    assert.equal(
      getCheckoutActionMode({
        pathname: "/checkout/details",
        fulfillmentType: FULFILLMENT_TYPE.PICKUP,
      }),
      "submit",
    );
  });

  test("delivery still continues from details to shipping details", () => {
    assert.equal(
      getCheckoutActionMode({
        pathname: "/checkout/details",
        fulfillmentType: FULFILLMENT_TYPE.DELIVERY,
      }),
      "next",
    );
  });

  test("shipping step always submits the order", () => {
    assert.equal(
      getCheckoutActionMode({
        pathname: "/checkout/shipping",
        fulfillmentType: FULFILLMENT_TYPE.DELIVERY,
      }),
      "submit",
    );
  });
});
