import { APP_CONFIG } from '@repo/config';

export interface RequestOptions extends RequestInit {
  tenantId?: string;
  correlationId?: string;
  token?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = APP_CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { tenantId, correlationId, token, headers, ...rest } = options;

    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...(tenantId && { 'x-tenant-id': tenantId }),
      ...(correlationId && { 'x-correlation-id': correlationId }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    };

    const res = await fetch(`${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
      ...rest,
      headers: requestHeaders,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error ${res.status}`);
    }

    return res.json() as Promise<T>;
  }
}

export const apiClient = new ApiClient();
