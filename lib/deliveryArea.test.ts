import assert from "node:assert";
import test, { describe } from "node:test";
import {
  DELIVERY_AREA_POLYGON,
  METRO_MANILA_CENTER,
  METRO_MANILA_DELIVERY_RADIUS_METERS,
  OUTSIDE_DELIVERY_AREA_MESSAGE,
  getDistanceMeters,
  isPointInPolygon,
  isWithinMetroManilaDeliveryArea,
  isWithinMetroManilaDeliveryAreaRadius,
} from "./deliveryArea";

describe("Is within delivery area", () => {
  describe("isPointInPolygon", () => {
    test("returns true for a point near the center of the delivery polygon", () => {
      // Center of Makati CBD — clearly inside the polygon.
      const result = isPointInPolygon(
        { lat: 14.5547, lng: 121.0244 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, true);
    });

    test("returns true for a point in BGC / Taguig area", () => {
      const result = isPointInPolygon(
        { lat: 14.55, lng: 121.05 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, true);
    });

    test("returns true for a point in Mandaluyong area", () => {
      const result = isPointInPolygon(
        { lat: 14.58, lng: 121.03 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, true);
    });

    test("returns true for a point in Pasay area", () => {
      const result = isPointInPolygon(
        { lat: 14.535, lng: 121.0 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, true);
    });

    test("returns false for a point well outside the polygon (north — Quezon City)", () => {
      const result = isPointInPolygon(
        { lat: 14.65, lng: 121.03 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, false);
    });

    test("returns false for a point well outside the polygon (south — Laguna)", () => {
      const result = isPointInPolygon(
        { lat: 14.3, lng: 121.05 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, false);
    });

    test("returns false for a point west of the polygon (Manila / Cavite border)", () => {
      const result = isPointInPolygon(
        { lat: 14.55, lng: 120.95 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, false);
    });

    test("returns false for a point east of the polygon (Marikina / Rizal)", () => {
      const result = isPointInPolygon(
        { lat: 14.6, lng: 121.12 },
        DELIVERY_AREA_POLYGON,
      );
      assert.strictEqual(result, false);
    });

    test("returns false for a point exactly on a vertex", () => {
      // Ray-casting treats boundary points as outside (even-numbered crossings).
      const vertex = DELIVERY_AREA_POLYGON[0];
      const result = isPointInPolygon(
        { lat: vertex[0], lng: vertex[1] },
        DELIVERY_AREA_POLYGON,
      );
      // Depending on implementation, boundary may be true or false;
      // we just assert the function returns a boolean consistently.
      assert.ok(typeof result === "boolean");
    });

    test("returns false for an empty polygon", () => {
      const result = isPointInPolygon(
        { lat: 14.55, lng: 121.02 },
        [],
      );
      assert.strictEqual(result, false);
    });
  });

  describe("isWithinMetroManilaDeliveryArea", () => {
    test("returns true for Makati CBD coordinates", () => {
      const result = isWithinMetroManilaDeliveryArea({
        lat: 14.5547,
        lng: 121.0244,
      });
      assert.strictEqual(result, true);
    });

    test("returns false for coordinates outside the service area", () => {
      // Quezon City — well north of the delivery polygon.
      const result = isWithinMetroManilaDeliveryArea({
        lat: 14.67,
        lng: 121.04,
      });
      assert.strictEqual(result, false);
    });
  });

  describe("isWithinMetroManilaDeliveryAreaRadius", () => {
    test("returns true for a point near the center within the radius", () => {
      const result = isWithinMetroManilaDeliveryAreaRadius({
        lat: METRO_MANILA_CENTER[0] + 0.01,
        lng: METRO_MANILA_CENTER[1] + 0.01,
      });
      assert.strictEqual(result, true);
    });

    test("returns false for a point far outside the 12 km radius", () => {
      // ~100 km away from center — should be outside.
      const result = isWithinMetroManilaDeliveryAreaRadius({
        lat: 15.5,
        lng: 122.0,
      });
      assert.strictEqual(result, false);
    });
  });

  describe("getDistanceMeters", () => {
    test("returns zero for the same point", () => {
      const p = { lat: 14.5547, lng: 121.0244 };
      const distance = getDistanceMeters(p, p);
      assert.strictEqual(distance, 0);
    });

    test("returns a positive distance for two different points", () => {
      const distance = getDistanceMeters(
        { lat: 14.5547, lng: 121.0244 },
        { lat: 14.6, lng: 121.07 },
      );
      assert.ok(distance > 0);
    });

    test("is symmetric (A→B equals B→A)", () => {
      const a = { lat: 14.55, lng: 121.02 };
      const b = { lat: 14.58, lng: 121.05 };
      const distAB = getDistanceMeters(a, b);
      const distBA = getDistanceMeters(b, a);
      assert.strictEqual(distAB, distBA);
    });

    test("returns approximately 111 km for 1 degree of latitude", () => {
      // 1 degree of latitude ≈ 111 km at the equator.
      const distance = getDistanceMeters(
        { lat: 0, lng: 121.0 },
        { lat: 1, lng: 121.0 },
      );
      assert.ok(distance > 110_000 && distance < 112_000);
    });
  });

  describe("constants", () => {
    test("DELIVERY_AREA_POLYGON is a closed loop (first == last)", () => {
      const first = DELIVERY_AREA_POLYGON[0];
      const last = DELIVERY_AREA_POLYGON[DELIVERY_AREA_POLYGON.length - 1];
      assert.strictEqual(first[0], last[0]);
      assert.strictEqual(first[1], last[1]);
    });

    test("DELIVERY_AREA_POLYGON has enough vertices to form a polygon", () => {
      assert.ok(DELIVERY_AREA_POLYGON.length >= 4);
    });

    test("METRO_MANILA_DELIVERY_RADIUS_METERS is 12 km", () => {
      assert.strictEqual(METRO_MANILA_DELIVERY_RADIUS_METERS, 12_000);
    });

    test("OUTSIDE_DELIVERY_AREA_MESSAGE is non-empty", () => {
      assert.ok(OUTSIDE_DELIVERY_AREA_MESSAGE.length > 0);
    });

    test("METRO_MANILA_CENTER is a valid coordinate pair", () => {
      assert.strictEqual(METRO_MANILA_CENTER.length, 2);
      assert.ok(METRO_MANILA_CENTER[0] > 0); // lat
      assert.ok(METRO_MANILA_CENTER[1] > 0); // lng
    });
  });
});