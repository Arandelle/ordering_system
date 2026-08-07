// ─── Schema ───────────────────────────────────────────────────────────────────

import z from "zod";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";
import {
  nameSchema,
  customerPhoneSchema,
  customerEmailSchema,
  orderNotesSchema,
  addressLine1Schema,
  zipCodeSchema,
  landmarkSchema,
} from "@/lib/validations";

export const CustomerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,

  customerPhone: customerPhoneSchema,

  customerEmail: customerEmailSchema,

  notes: orderNotesSchema,
});

const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const FulfillmentSchema = z.enum([
  FULFILLMENT_TYPE.DELIVERY,
  FULFILLMENT_TYPE.PICKUP,
  FULFILLMENT_TYPE.DINE_IN,
]);

/** Reservation schema — required for dine-in orders */
export const ReservationSchema = z.object({
  scheduledAt: z
    .string()
    .min(1, "Reservation date and time is required")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Invalid date format"),
  partySize: z
    .number()
    .min(1, "At least 1 guest is required")
    .max(20, "Maximum 20 guests"),
});

/** Pickup time schema — required for pickup orders */
export const PickupTimeSchema = z
  .string()
  .min(1, "Pickup date and time is required")
  .refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Invalid date format");

export const ShippingFieldsSchema = z.object({
  line1: addressLine1Schema,
  line2: z.string().min(1, "Please provide brgy/village"),
  city: z.string().min(1, "City is required"),
  cityCode: z.string().optional(),
  province: z.string().min(1, "Province is required"),
  region: z.string().optional(),
  regionCode: z.string().optional(),
  barangayCode: z.string().optional(),
  subMunicipality: z.string().optional(),
  subMunicipalityCode: z.string().optional(),
  zipCode: zipCodeSchema,
  country: z.literal("Philippines"),
  landmark: landmarkSchema,
  placeName: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
  /** City resolved from the map pin — used to warn when dropdown city diverges. */
  pinnedCity: z.string().optional(),
  /** Barangay resolved from the map pin — used to warn when dropdown barangay diverges. */
  pinnedLine2: z.string().optional(),
});

export const ShippingSchema = ShippingFieldsSchema.superRefine((value, ctx) => {
  if (!value.coordinates) {
    ctx.addIssue({
      code: "custom",
      path: ["coordinates"],
      message: "Pin your delivery location on the map",
    });
  }

  // City-level restriction (admin-configured delivery areas) is validated
  // on the backend via isCityAllowedForDelivery in checkoutFulfillment.service.
});

const DeliveryOrderFormSchema = z.object({
  fulfillmentType: z.literal(FULFILLMENT_TYPE.DELIVERY),
  customer: CustomerSchema,
  shippingAddress: ShippingSchema,
  reservation: z.unknown().optional(),
  pickupTime: z.unknown().optional(),
});

const PickupOrderFormSchema = z.object({
  fulfillmentType: z.literal(FULFILLMENT_TYPE.PICKUP),
  customer: CustomerSchema,
  shippingAddress: z.unknown(),
  reservation: z.unknown().optional(),
  pickupTime: PickupTimeSchema,
});

const DineInOrderFormSchema = z.object({
  fulfillmentType: z.literal(FULFILLMENT_TYPE.DINE_IN),
  customer: CustomerSchema,
  shippingAddress: z.unknown(),
  reservation: ReservationSchema,
  pickupTime: z.unknown().optional(),
});

export const OrderFormSchema = z.discriminatedUnion("fulfillmentType", [
  DeliveryOrderFormSchema,
  PickupOrderFormSchema,
  DineInOrderFormSchema,
]);

export type OrderFormState = {
  fulfillmentType: z.infer<typeof FulfillmentSchema>;
  customer: z.infer<typeof CustomerSchema>;
  shippingAddress: z.infer<typeof ShippingFieldsSchema>;
  reservation: z.infer<typeof ReservationSchema>;
  pickupTime: string;
};
