import { supabase } from './supabase';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email || '';

  const headers = new Headers(options.headers || {});
  headers.set('x-user-email', email);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Attempt to parse error message, but don't fail if it's not JSON
    try {
      const errorData = await response.clone().json();
      if (errorData.error) {
        throw new Error(errorData.error);
      }
    } catch (e) {
      // Ignore JSON parse error for error responses
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response;
}
