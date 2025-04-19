import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "survey_response" | "system" | "alert";
}

export function useNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      // In a real app, this would fetch from an API
      // For now, we'll use mock data
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Survey Response",
          message: "John Doe submitted a response to your survey",
          read: false,
          createdAt: new Date().toISOString(),
          type: "survey_response",
        },
        {
          id: "2",
          title: "System Update",
          message: "New features have been added to the platform",
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          type: "system",
        },
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.read).length);
    }
  }, [session]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
  };
} 