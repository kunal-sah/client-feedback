import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: [
    "/surveys/:path*",
    "/responses/:path*",
    "/admin/:path*",
  ],
}; 