import { useSession } from "next-auth/react";
import { UserNav } from "@/components/layout/user-nav";
import { NotificationsDropdown } from "@/components/notifications/notifications-dropdown";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Navigation() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Feedback Monthly</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center space-x-2">
            {session ? (
              <>
                <NotificationsDropdown />
                <UserNav />
              </>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 