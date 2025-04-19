import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define route access patterns
const publicRoutes = ["/", "/login", "/register", "/api/auth"];
const superAdminRoutes = ["/admin", "/api/admin"];
const companyAdminRoutes = ["/company", "/api/company"];
const clientRoutes = ["/surveys/respond", "/api/surveys/respond"];

// Define role constants
const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  COMPANY_MANAGER: "COMPANY_MANAGER",
  COMPANY_HR: "COMPANY_HR",
  CLIENT: "CLIENT",
} as const;

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Require authentication for all other routes
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Role-based access control
  const userRole = token.role as string;

  // Super Admin has access to everything
  if (userRole === ROLES.SUPER_ADMIN) {
    return NextResponse.next();
  }

  // Company Admin restrictions
  if (userRole === ROLES.COMPANY_ADMIN) {
    if (superAdminRoutes.some((route) => pathname.startsWith(route))) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    return NextResponse.next();
  }

  // Company Manager/HR restrictions
  if (userRole === ROLES.COMPANY_MANAGER || userRole === ROLES.COMPANY_HR) {
    if (
      superAdminRoutes.some((route) => pathname.startsWith(route)) ||
      companyAdminRoutes.some((route) => pathname.startsWith(route))
    ) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    return NextResponse.next();
  }

  // Client restrictions
  if (userRole === ROLES.CLIENT) {
    if (!clientRoutes.some((route) => pathname.startsWith(route))) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 