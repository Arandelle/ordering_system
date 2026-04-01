import { StaffRole } from "@/types/staff";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in env variables!");
}

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const COOKIE_NAMES = {
  ADMIN_TOKEN: "admin_token",
  CUSTOMER_TOKEN: "customer_token",
};

export type CookieType = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function getAuth(request: NextRequest, cookieName: CookieType) {
  const token = request.cookies.get(cookieName)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return payload;
}

export async function getAdminAuth(request: NextRequest) {
  const payload = await getAuth(request, COOKIE_NAMES.ADMIN_TOKEN);
  if (!payload) return null;

  return {
    id: payload.id as string,
    email: payload.email as string,
    role: payload.role as StaffRole,
    branch: payload.branch as string,
  };
}

export async function getCustomerAuth(request: NextRequest) {
  const payload = await getAuth(request, COOKIE_NAMES.CUSTOMER_TOKEN);
  if (!payload) return null;

  return {
    id: payload.id as string,
    email: payload.email as string,
  };
}

export async function requireAdmin(request: NextRequest) {
  const admin = await getAdminAuth(request);
  if (!admin) throw new Error("Unauthorized!");

  return admin;
}
