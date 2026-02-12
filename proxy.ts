import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy to handle subdomain-based routing
 * - localhost:3000 → routes to /main (company site)
 * - food.localhost:3000 → routes to /customer (ordering app)
 * - order.localhost:3000 → routes to /customer (ordering app)
 */
export function proxy(request: NextRequest) {
  //  By calling .clone(), you get a new URL instance that you can safely modify
  const url = request.nextUrl.clone() 
  const hostname = request.headers.get('host') || ''
  const { pathname } = url
  
  // Extract subdomain from hostname (e.g., "food" from "food.localhost:3000")
  const subdomain = hostname.split('.')[0]
  
  // Debug logging to see what's being routed
  console.log('Hostname:', hostname, 'Subdomain:', subdomain, 'Path:', pathname)
  
  // Skip rewriting if already routed to /main or /customer
  // This prevents infinite rewrite loops
  if (pathname.startsWith('/main') || pathname.startsWith('/customer') || pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // Route customer ordering subdomains to /customer folder
  if (subdomain === 'food' || subdomain === 'order') {
    url.pathname = `/customer${pathname}`
    return NextResponse.rewrite(url)
  }

  if (subdomain === 'admin') {
    url.pathname = `/admin${pathname}`
    return NextResponse.rewrite(url)
  }
  
  // Default: route main domain (localhost) to /main folder
  url.pathname = `/main${pathname}`
  return NextResponse.rewrite(url)
}

/**
 * Configuration for which paths the proxy should run on
 * Excludes:
 * - api: API routes
 * - _next/static: Static files from Next.js
 * - _next/image: Next.js image optimization
 * - favicon.ico: Favicon
 * - images: Static images from public/images folder
 * - main: Already routed pages (prevents loop)
 * - customer: Already routed pages (prevents loop)
 * - Add more
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|main|customer|videos|promos|privacy-policy|paymongo|admin).*)',
  ],
}