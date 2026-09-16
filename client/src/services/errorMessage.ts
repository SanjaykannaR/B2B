// Shared helper to extract a human-friendly message from an API error.
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (!err) return fallback;

  const e = err as {
    response?: { data?: { message?: string; error?: string } };
    request?: unknown;
    code?: string;
    message?: string;
  };

  if (e.response?.data?.message) return e.response.data.message;
  if (e.response?.data?.error) return e.response.data.error;

  const isNetworkError =
    e.code === 'ERR_NETWORK' ||
    e.code === 'ECONNABORTED' ||
    e.code === 'ECONNREFUSED' ||
    e.message === 'Network Error' ||
    (!e.response && !!e.request);

  if (isNetworkError) {
    return 'Cannot reach the server. Please check that the backend is running and try again.';
  }

  if (e.message) return e.message;
  return fallback;
}
