import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface RegenerateBackupCodesProps {
  onComplete: (codes: string[]) => void;
}

export function RegenerateBackupCodes({ onComplete }: RegenerateBackupCodesProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newCodes, setNewCodes] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/2fa/backup-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setNewCodes(data.backupCodes);
      onComplete(data.backupCodes);
      
      toast({
        title: "Success",
        description: "New backup codes have been generated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate backup codes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="code">Current Backup Code</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter a current backup code"
            required
          />
          <p className="text-sm text-gray-500">
            Enter one of your current backup codes to generate new ones.
          </p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !code}
        >
          {isLoading ? "Generating..." : "Generate New Backup Codes"}
        </Button>
      </form>

      {newCodes.length > 0 && (
        <Card className="p-4 mt-4">
          <h3 className="text-lg font-semibold mb-2">New Backup Codes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Save these backup codes in a secure place. Each code can only be used once.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {newCodes.map((code, index) => (
              <code
                key={index}
                className="p-2 bg-gray-100 rounded text-sm font-mono"
              >
                {code}
              </code>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
} 