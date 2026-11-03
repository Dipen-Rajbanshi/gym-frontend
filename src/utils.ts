// Returns the list from a plain array or from a wrapped response (HAL _embedded, content, data)
export function extractList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (!data || typeof data !== "object") return [];

  const d = data as Record<string, any>;
  if (Array.isArray(d._embedded?.[key])) return d._embedded[key] as T[];
  if (Array.isArray(d.content)) return d.content as T[];
  if (Array.isArray(d.data)) return d.data as T[];
  if (Array.isArray(d[key])) return d[key] as T[];
  return [];
}