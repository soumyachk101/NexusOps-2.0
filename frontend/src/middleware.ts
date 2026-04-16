export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/autofix/:path*", "/memory/:path*", "/settings/:path*"]
}
