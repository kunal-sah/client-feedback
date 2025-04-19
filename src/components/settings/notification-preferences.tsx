import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationPreferencesProps {
  userId: string;
  preferences: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

export function NotificationPreferences({
  userId,
  preferences: initialPreferences,
}: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState(initialPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleToggle = async (key: keyof typeof preferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(newPreferences);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification preferences");
      }

      toast({
        title: "Success",
        description: "Notification preferences updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
      // Revert the change on error
      setPreferences(initialPreferences);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Email Notifications</Label>
          <p className="text-sm text-gray-500">
            Receive notifications via email
          </p>
        </div>
        <Switch
          checked={preferences.email}
          onCheckedChange={() => handleToggle("email")}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Push Notifications</Label>
          <p className="text-sm text-gray-500">
            Receive push notifications in your browser
          </p>
        </div>
        <Switch
          checked={preferences.push}
          onCheckedChange={() => handleToggle("push")}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>In-App Notifications</Label>
          <p className="text-sm text-gray-500">
            Show notifications within the application
          </p>
        </div>
        <Switch
          checked={preferences.inApp}
          onCheckedChange={() => handleToggle("inApp")}
          disabled={isLoading}
        />
      </div>
    </div>
  );
} 