import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { API_BASE_URL } from "./constants";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Fügt API-Basispfad zur URL hinzu, wenn URL mit /api/ beginnt
function getFullUrl(url: string): string {
  if (url.startsWith('/api/')) {
    // Im Entwicklungsmodus bleibt die URL unverändert, in Produktion wird der API_BASE_URL vorangestellt
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<any> {
  const fullUrl = getFullUrl(url);
  
  const res = await fetch(fullUrl, {
    ...options,
    credentials: "include",
    headers: {
      ...(options?.headers || {}),
      ...(options?.body ? { "Content-Type": "application/json" } : {})
    }
  });

  await throwIfResNotOk(res);
  return res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Verwendung der Funktion getFullUrl für queryKey[0]
    const fullUrl = getFullUrl(queryKey[0] as string);
    
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
