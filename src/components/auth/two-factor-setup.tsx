import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { generateSecret, verifyToken } from "@/lib/totp";

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<"initial" | "verify">("initial");
  const [secret, setSecret] = useState<string>("");
  const [qrCode, setQrCode] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to setup 2FA");
      }

      const data = await response.json();
      setSecret(data.secret);
      setQrCode(data.qrCode);
      setStep("verify");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to setup 2FA. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
          secret,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes);
      toast({
        title: "Success",
        description: "2FA has been enabled successfully.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Set Up Two-Factor Authentication</h2>

      {step === "initial" && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Enhance your account security by enabling two-factor authentication.
            You'll need to scan a QR code with your authenticator app.
          </p>
          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Setting up..." : "Set Up 2FA"}
          </Button>
        </div>
      )}

      {step === "verify" && (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="text-gray-600">
              Scan this QR code with your authenticator app:
            </p>
            <div className="flex justify-center">
              <QRCodeSVG value={qrCode} size={200} />
            </div>
            <p className="text-sm text-gray-500 text-center">
              Or enter this code manually: {secret}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={isLoading || verificationCode.length !== 6}
            className="w-full"
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      )}

      {backupCodes.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Backup Codes</h3>
          <p className="text-sm text-gray-600">
            Save these backup codes in a secure place. You can use them to access
            your account if you lose your authenticator device.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <code
                key={index}
                className="p-2 bg-gray-100 rounded text-sm font-mono"
              >
                {code}
              </code>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
} 