import { APP_CONFIG } from '@repo/config';

export interface TenantInfo {
  slug: string;
  isSubdomain: boolean;
  hostname: string;
}

export function getTenantFromHostname(hostname: string): TenantInfo {
  // Handle localhost scenarios (e.g. devsinc.localhost:3000)
  const cleanHost = hostname.split(':')[0].toLowerCase();
  
  if (cleanHost === 'localhost' || cleanHost === '127.0.0.1' || cleanHost === APP_CONFIG.MAIN_DOMAIN) {
    return {
      slug: 'root',
      isSubdomain: false,
      hostname: cleanHost,
    };
  }

  // Example: devsinc.tribyte360.com -> devsinc
  if (cleanHost.endsWith(APP_CONFIG.MAIN_DOMAIN)) {
    const parts = cleanHost.replace(`.${APP_CONFIG.MAIN_DOMAIN}`, '').split('.');
    return {
      slug: parts[parts.length - 1],
      isSubdomain: true,
      hostname: cleanHost,
    };
  }

  // Fallback for local testing (e.g. acme.localhost)
  const parts = cleanHost.split('.');
  if (parts.length > 1) {
    return {
      slug: parts[0],
      isSubdomain: true,
      hostname: cleanHost,
    };
  }

  return {
    slug: 'default',
    isSubdomain: false,
    hostname: cleanHost,
  };
}
