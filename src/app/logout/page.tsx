import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default async function LogoutPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to home
  if (!session?.user) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Logout</h1>
        <p className="mb-6 text-muted-foreground">
          Are you sure you want to log out?
        </p>
        <form action={async () => {
          "use server";
          await signOut({ redirect: true, callbackUrl: "/" });
        }}>
          <Button type="submit" className="w-full">
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
} 