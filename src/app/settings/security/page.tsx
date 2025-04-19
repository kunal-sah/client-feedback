import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { Disable2FA } from "@/components/auth/disable-2fa";
import { RegenerateBackupCodes } from "@/components/auth/regenerate-backup-codes";

async function getUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      twoFactorEnabled: true,
    },
  });

  return user;
}

export default async function SecurityPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = await getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Security Settings</h1>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Two-Factor Authentication</h2>
            
            {user.twoFactorEnabled ? (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">
                  Two-factor authentication is enabled
                </p>
                <p className="text-gray-600">
                  Your account is protected with an additional layer of security.
                  You'll need to enter a verification code from your authenticator
                  app when signing in.
                </p>
                <Disable2FA onComplete={() => {
                  // Refresh the page to show updated status
                  window.location.reload();
                }} />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Enhance your account security by enabling two-factor authentication.
                  You'll need to scan a QR code with your authenticator app.
                </p>
                <TwoFactorSetup onComplete={() => {
                  // Refresh the page to show updated status
                  window.location.reload();
                }} />
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Backup Codes</h2>
            <p className="text-gray-600 mb-4">
              Backup codes can be used to access your account if you lose your
              authenticator device. Each code can only be used once.
            </p>
            <RegenerateBackupCodes onComplete={(codes) => {
              // Show the new backup codes to the user
              console.log("New backup codes:", codes);
            }} />
          </Card>
        </div>
      </div>
    </div>
  );
} 