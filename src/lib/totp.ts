import { authenticator } from "otplib";
import { randomBytes } from "crypto";

// Configure TOTP
authenticator.options = {
  window: 1, // Allow 1 step before/after for time drift
  step: 30, // 30-second time step
};

export function generateSecret(): string {
  return authenticator.generateSecret();
}

export function generateQRCode(secret: string, email: string): string {
  return authenticator.keyuri(email, "Client Feedback Monthly", secret);
}

export function verifyToken(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    return false;
  }
}

export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    codes.push(code);
  }
  return codes;
} 