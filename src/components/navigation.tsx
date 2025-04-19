import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenuContent align="end" className="w-56">
  <DropdownMenuLabel>My Account</DropdownMenuLabel>
  <DropdownMenuSeparator />
  <DropdownMenuItem asChild>
    <Link href="/profile">Profile</Link>
  </DropdownMenuItem>
  <DropdownMenuItem asChild>
    <Link href="/settings">Settings</Link>
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem asChild>
    <Link href="/logout">Logout</Link>
  </DropdownMenuItem>
</DropdownMenuContent> 