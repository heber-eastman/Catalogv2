import * as React from "react";
import { useAuth } from "@clerk/clerk-react";
import { apiRequest } from "../lib/api";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";
const DEFAULT_ORG_SLUG = import.meta.env.VITE_ORGANIZATION_SLUG as string | undefined;

function buildUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedBase = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${normalizedBase}/${normalizedPath}`;
}

export function useApiClient() {
  const { getToken } = useAuth();

  return React.useCallback(
    async <T>(path: string, options: RequestInit = {}) => {
      const token = await getToken();
      const headers = new Headers(options.headers);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const slugHeader = headers.get("X-Catalog-Organization");
      if (!slugHeader && DEFAULT_ORG_SLUG) {
        headers.set("X-Catalog-Organization", DEFAULT_ORG_SLUG);
      }

      return apiRequest<T>(buildUrl(path), {
        ...options,
        headers,
      });
    },
    [getToken],
  );
}

