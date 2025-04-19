import { Notification } from '@/contexts/notifications-context';
import prisma from './prisma';

export interface InAppNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, any>;
}

export async function sendInAppNotification(
  userId: string,
  notification: InAppNotificationData
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        notificationPreferences: true,
      },
    });

    if (!user?.notificationPreferences?.inApp) {
      return false;
    }

    // In a real application, you would store this in a database
    // For now, we'll just return success
    return true;
  } catch (error) {
    console.error('Error sending in-app notification:', error);
    return false;
  }
}

export async function sendInAppNotificationToMany(
  userIds: string[],
  notification: InAppNotificationData
): Promise<{
  success: boolean;
  stats: {
    total: number;
    succeeded: number;
    failed: number;
  };
}> {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendInAppNotification(userId, notification))
  );

  const succeeded = results.filter(
    (result) => result.status === 'fulfilled' && result.value
  ).length;

  const failed = results.filter(
    (result) => result.status === 'rejected' || !result.value
  ).length;

  return {
    success: true,
    stats: {
      total: userIds.length,
      succeeded,
      failed,
    },
  };
}

// Helper function to create a notification for a new survey
export function createSurveyNotification(surveyId: string, teamMemberName: string): InAppNotificationData {
  return {
    title: 'New Survey Available',
    message: `You have a new survey to complete for ${teamMemberName}.`,
    type: 'info',
    data: {
      url: `/surveys/${surveyId}`,
    },
  };
}

// Helper function to create a notification for a survey reminder
export function createSurveyReminderNotification(surveyId: string, teamMemberName: string): InAppNotificationData {
  return {
    title: 'Survey Reminder',
    message: `Don't forget to complete the survey for ${teamMemberName}.`,
    type: 'warning',
    data: {
      url: `/surveys/${surveyId}`,
    },
  };
}

// Helper function to create a notification for a survey completion
export function createSurveyCompletedNotification(surveyId: string, teamMemberName: string): InAppNotificationData {
  return {
    title: 'Survey Completed',
    message: `Thank you for completing the survey for ${teamMemberName}.`,
    type: 'success',
    data: {
      url: `/surveys/${surveyId}`,
    },
  };
}

// Helper function to create a notification for a new client
export function createNewClientNotification(clientId: string, clientName: string): InAppNotificationData {
  return {
    title: 'New Client Added',
    message: `${clientName} has been added as a new client.`,
    type: 'info',
    data: {
      url: `/clients/${clientId}`,
    },
  };
}

// Helper function to create a notification for a new team member
export function createNewTeamMemberNotification(teamMemberId: string, teamMemberName: string): InAppNotificationData {
  return {
    title: 'New Team Member',
    message: `${teamMemberName} has joined your team.`,
    type: 'info',
    data: {
      url: `/team/${teamMemberId}`,
    },
  };
}

// Helper function to create a notification for 2FA status change
export function createTwoFactorStatusNotification(enabled: boolean): InAppNotificationData {
  return {
    title: `Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'}`,
    message: `Two-factor authentication has been ${enabled ? 'enabled' : 'disabled'} for your account.`,
    type: enabled ? 'success' : 'warning',
  };
}

// Helper function to create a notification for a new login
export function createNewLoginNotification(loginInfo: { ip: string; location: string; device: string }): InAppNotificationData {
  return {
    title: 'New Login Detected',
    message: `A new login was detected from ${loginInfo.location} using ${loginInfo.device}.`,
    type: 'warning',
    data: {
      url: '/settings/security',
    },
  };
} 