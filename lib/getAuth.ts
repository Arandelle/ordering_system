import { STAFF_ROLES, StaffRole } from "@/types/staff";
import { JWTPayload, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { connectDB } from "./mongodb";
import { auth } from "./auth";
import { headers } from "next/headers";
import { User } from "@/models/User";
import { Types } from "mongoose";
import Staff from "@/models/Staff";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in env variables!");
}

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export const COOKIE_NAMES = {
  ADMIN_TOKEN: "admin_token",
  CUSTOMER_TOKEN: "customer_token",
};

export type CookieType = (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES];

export type AdminTokenPayload = JWTPayload & {
  id?: unknown;
  role?: unknown;
  isActive?: unknown;
};

export type AdminAuth = {
  id: string;
  role: StaffRole;
  isActive: boolean;
};

export type AuthenticatedAdmin = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: StaffRole;
  branch?: Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const isStaffRole = (role: unknown): role is StaffRole =>
  typeof role === "string" &&
  Object.values(STAFF_ROLES).includes(role as StaffRole);

export async function verifyToken(
  token: string,
): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload) throw new Error("Unauthorized");
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

export async function getAuth(
  request: NextRequest,
  cookieName: CookieType,
): Promise<AdminTokenPayload | null> {
  const token = request.cookies.get(cookieName)?.value;

  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return payload;
}

export async function getAdminAuth(
  request: NextRequest,
): Promise<AdminAuth | null> {
  const payload = await getAuth(request, COOKIE_NAMES.ADMIN_TOKEN);
  if (
    typeof payload?.id !== "string" ||
    !isStaffRole(payload.role) ||
    typeof payload.isActive !== "boolean"
  )
    return null;

  return {
    id: payload.id,
    role: payload.role,
    isActive: payload.isActive,
  };
}

export async function requireAdmin(request: NextRequest) : Promise<AuthenticatedAdmin> {
  const admin = await getAdminAuth(request);
  if (!admin) throw new Error("Unauthorized!");

  await connectDB();
  const staffRecord = await Staff.findById(admin.id).lean();
  if (!staffRecord || !staffRecord.isActive) throw new Error("Unauthorized");
  return staffRecord;
}

export async function requireSuperAdmin(request: NextRequest) {
  const superadmin = await requireAdmin(request);
  if (superadmin.role !== STAFF_ROLES.SUPERADMIN) {
    throw new Error("Access denied. Superadmin privileges required.");
  }
  return superadmin;
}

// use new authenticaton better auth
export async function requireBetterAuth(request?: Request) {
  const requestHeaders = request
    ? request.headers // Expo : Bearer token from authorization header
    : await headers(); // Next.js : cookies from server context

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) return null;

  await connectDB();

  const user = await User.findOne({
    _id: session.session.userId,
  }).lean();

  if (!user) return null;

  return user;
}
