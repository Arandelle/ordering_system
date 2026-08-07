const BASE_URL = "/api";

export type ApiError = {
  message: string;
  details?: any;
  status?: number;
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(BASE_URL + url, {
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Extract error message from various response formats
    let errorMessage = "Request failed";
    
    if (data?.error) {
      // Standard API error format: { error: "message" }
      errorMessage = data.error;
    } else if (data?.message) {
      // Alternative format: { message: "message" }
      errorMessage = data.message;
    } else if (response.status === 500) {
      // Server error without JSON response (likely a crash)
      errorMessage = "Server error. Please try again or contact support.";
    }
    
    throw {
      message: errorMessage,
      details: data,
      status: response.status,
    } as ApiError;
  }

  return data;
}

export const apiClient = {
  get: <T>(url: string) => request<T>(url, { method: "GET" }),

  post: <T, B = unknown>(url: string, body?: B) =>
  request<T>(url, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  }),

  put: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: unknown) =>
    request<T>(url, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined
    }),
  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
