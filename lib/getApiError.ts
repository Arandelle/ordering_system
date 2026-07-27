import { NextResponse } from "next/server";

interface APIErrorOptions {
  fallbackMessage?: string;
  extra?: Record<string, unknown>;
}

/**
 *
 * @param error - Error message you want to tell to the user
 * @param statusCode - status code of it e.g - 401, 404, 500
 * @param options - optional fallbackMessage and exta response fields
 * @returns
 */
export function getAPIError(
  error: unknown,
  statusCode: number = 500,
  options: APIErrorOptions = {},
) {
  const { fallbackMessage = "Internal Server Error", extra } = options;

  const err = typeof error === "string" ? new Error(error) : error;
  console.error(error);

  const message = err instanceof Error ? err.message : fallbackMessage;
  return NextResponse.json(
    { error: message, ...extra },
    { status: statusCode },
  );
}

// ---------------------------------------------------------------------------
// Standardized error helpers — keep route handlers clean
// ---------------------------------------------------------------------------

/** 400 — Invalid single ObjectId */
export function getInvalidIdError(field = "ID") {
  return getAPIError(`Invalid ${field}`, 400);
}

/** 400 — One or more invalid ObjectIds in a batch */
export function getInvalidIdsError(field = "IDs") {
  return getAPIError(`One or more invalid ${field}`, 400);
}

/** 404 — Resource not found */
export function getNotFoundError(resource = "Resource") {
  return getAPIError(`${resource} not found`, 404);
}

/** 403 — Permission denied */
export function getForbiddenError() {
  return getAPIError("Forbidden", 403);
}

/** 400 — Array size out of bounds */
export function getInvalidArraySizeError(
  field: string,
  min: number,
  max: number,
) {
  return getAPIError(
    `${field} must contain between ${min} and ${max} items`,
    400,
  );
}
/** 500 — Internal server error */
export function getInternalServerError(error: any, fallbackMessage: string = "Internal Server Error.") {
  return getAPIError(error, 500, { fallbackMessage });
}
