type ApiClientError = {
  message?: string;
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;

  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as ApiClientError).message);
  }

  return "Failed to fetch dashboard data";
};