// ─── Schema ───────────────────────────────────────────────────────────────────

import z from "zod";
import {
  isWithinMetroManilaDeliveryArea,
  OUTSIDE_DELIVERY_AREA_MESSAGE,
} from "@/lib/deliveryArea";
import { FULFILLMENT_TYPE } from "@/types/orderConstants";

export const CustomerSchema = z.object({
  firstName: z.string().min(1, "Firstname is required"),
  lastName: z.string().min(1, "Last name is required"),

  customerPhone: z
    .string()
    .regex(/^(09|\+639)\d{9}$/, "Invalid PH mobile number"),

  customerEmail: z
    .string()
    .email("Invalid emaild address"),

  notes: z.string().optional().or(z.literal("")),
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

const ShippingFieldsSchema = z.object({
  line1: z.string().min(1, "Please provide your house no."),
  line2: z.string().min(1, "Please provide brgy/village"),
  city: z.string().min(1, "City is required"),
  cityCode: z.string().optional(),
  province: z.string().min(1, "Province is required"),
  region: z.string().optional(),
  regionCode: z.string().optional(),
  barangayCode: z.string().optional(),
  subMunicipality: z.string().optional(),
  subMunicipalityCode: z.string().optional(),
  zipCode: z.string().min(1, "Postal code is required"),
  country: z.literal("Philippines"),
  landmark: z.string().optional(),
  placeName: z.string().optional(),
  coordinates: CoordinatesSchema.optional(),
});

export const ShippingSchema = ShippingFieldsSchema.superRefine((value, ctx) => {
  if (!value.coordinates) {
    ctx.addIssue({
      code: "custom",
      path: ["coordinates"],
      message: "Pin your delivery location on the map",
    });
    return;
  }

  if (!isWithinMetroManilaDeliveryArea(value.coordinates)) {
    ctx.addIssue({
      code: "custom",
      path: ["coordinates"],
      message: OUTSIDE_DELIVERY_AREA_MESSAGE,
    });
  }
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
