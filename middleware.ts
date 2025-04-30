import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Protected routes that require authentication
  const protectedPaths = ["/create", "/edit", "/settings"]

  const path = request.nextUrl.pathname

  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some((prefix) => path.startsWith(prefix)) && !isAuthenticated) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If user is authenticated and tries to access login/register
  if (isAuthenticated && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/create/:path*", "/edit/:path*", "/settings/:path*", "/login", "/register"],
}
