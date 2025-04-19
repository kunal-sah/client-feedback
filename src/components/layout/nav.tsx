import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";

export function Nav() {
  const pathname = usePathname();
  const { isAuthenticated, role } = useAuth();

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="font-bold">
            Client Feedback
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/dashboard"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/dashboard"
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Dashboard
              </Link>
              <Link
                href="/surveys"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === "/surveys"
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                Surveys
              </Link>
              {role === "SUPER_ADMIN" && (
                <Link
                  href="/admin"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === "/admin"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <NotificationsDropdown />
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  Settings
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 