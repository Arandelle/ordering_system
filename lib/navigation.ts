// lib/navigation.ts
/**
 * Get the base URL for a specific subdomain
 * @param subdomain - The subdomain (e.g., 'food', 'order') or undefined for main domain
 * @returns Full URL with protocol and domain
 */
export function getSubdomainUrl(subdomain?: string): string {
  // Server-side: return empty string (not needed for SSR)
  if (typeof window === 'undefined') {
    return ''
  }

  const { protocol, hostname, port } = window.location

  // Localhost development
  if (hostname.includes('localhost')) {
    if (!subdomain) {
      // Main domain: localhost:3000
      return `${protocol}//localhost:${port}`
    }
    // Subdomain: food.localhost:3000
    return `${protocol}//${subdomain}.localhost:${port}`
  }

  // Production
  const parts = hostname.split('.')
  
  // Get root domain (e.g., "domain.com" from "food.domain.com" or "domain.com")
  // If hostname is already a subdomain, take last 2 parts
  // If hostname is main domain, it's already correct
  const rootDomain = parts.length > 2 
    ? parts.slice(-2).join('.') // "domain.com"
    : hostname // "domain.com"

  if (!subdomain) {
    // Main domain: https://domain.com
    return `${protocol}//${rootDomain}`
  }

  // Subdomain: https://food.domain.com
  return `${protocol}//${subdomain}.${rootDomain}`
}

/**
 * Get full URL for a path on a specific subdomain
 * @param path - The path (e.g., '/menu', '/order')
 * @param subdomain - The subdomain or undefined for main domain
 */
export function getSubdomainPath(path: string, subdomain?: string): string {
  const baseUrl = getSubdomainUrl(subdomain)
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  return `${baseUrl}${cleanPath}`
}