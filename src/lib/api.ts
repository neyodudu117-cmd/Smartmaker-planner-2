import { supabase } from './supabase';

export async function apiFetch(url: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const email = session?.user?.email || '';

  const headers = new Headers(options.headers || {});
  headers.set('x-user-email', email);

  return fetch(url, {
    ...options,
    headers,
  });
}
