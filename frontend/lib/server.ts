import { api } from './api';

/** Server-component fetch that never throws: returns null when the API is
 * unreachable so the page can render its own error state. */
export async function load<T>(path: string): Promise<T | null> {
  try {
    return await api.get<T>(path);
  } catch {
    return null;
  }
}
