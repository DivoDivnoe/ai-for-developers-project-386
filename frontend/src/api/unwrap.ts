type FetchResult = { data?: unknown; error?: unknown; response: Response };

export async function unwrap<T>(promise: Promise<FetchResult>): Promise<T> {
  const { data, response } = await promise;
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return data as T;
}
