export const pageStatus = {
    '/checkout' : true,
    '/orders': false,
}

export function isRouteBlocked(pathname: string): boolean {
  if (pathname in pageStatus) {
    return !pageStatus[pathname as keyof typeof pageStatus]
  }

  for (const route in pageStatus) {
    if (pathname.startsWith(route + '/')) {
      return !pageStatus[route as keyof typeof pageStatus]
    }
  }

  return false
}