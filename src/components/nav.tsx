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
import { cn } from "@/lib/utils";

interface NavLink {
  name: string;
  href: string;
}

interface Navigation {
  superAdmin: NavLink[];
  companyAdmin: NavLink[];
  teamMember: NavLink[];
  client: NavLink[];
}

const navigation: Navigation = {
  superAdmin: [
    { name: "Dashboard", href: "/super-admin/dashboard" },
    { name: "Companies", href: "/super-admin/companies" },
    { name: "Users", href: "/super-admin/users" },
    { name: "Analytics", href: "/super-admin/analytics" },
    { name: "Roles", href: "/super-admin/roles" },
  ],
  companyAdmin: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Clients", href: "/clients" },
    { name: "Team", href: "/team" },
    { name: "Surveys", href: "/surveys" },
    { name: "Settings", href: "/settings" },
  ],
  teamMember: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Clients", href: "/my-clients" },
    { name: "Surveys", href: "/surveys" },
  ],
  client: [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Feedback", href: "/my-feedback" },
  ],
};

export function Nav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session?.user) return null;

  const role = session.user.role;
  let links: NavLink[] = [];

  switch (role) {
    case "SUPER_ADMIN":
      links = navigation.superAdmin;
      break;
    case "COMPANY_ADMIN":
      links = navigation.companyAdmin;
      break;
    case "TEAM_MEMBER":
      links = navigation.teamMember;
      break;
    case "CLIENT":
      links = navigation.client;
      break;
  }

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/" className="flex items-center font-medium">
              Client Feedback
            </Link>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center px-1 pt-1 text-sm font-medium",
                  pathname === link.href
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.name}
              </Link>
            ))}
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