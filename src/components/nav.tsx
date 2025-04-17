'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, BarChart } from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!session) {
    return (
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center font-medium">
                Client Feedback
              </Link>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => signIn()}>
                Sign in
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link
              href="/"
              className="flex items-center font-medium"
            >
              Client Feedback
            </Link>
            <Link
              href="/surveys"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                isActive("/surveys")
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Surveys
            </Link>
            <Link
              href="/clients"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                isActive("/clients")
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Clients
            </Link>
            <Link
              href="/team"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                isActive("/team")
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Team
            </Link>
            <Link
              href="/reports"
              className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                isActive("/reports")
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Reports
            </Link>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  {session.user.email}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
} 