export interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as ApiErrorPayload).message;
    if (message) return message;
  }

  return fallback;
}
