import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not set in environment variables");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
  templateId,
  dynamicTemplateData,
}: EmailData) {
  try {
    const msg: any = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@yourdomain.com',
      subject,
    };

    // Add content if text or html is provided
    if (text || html) {
      msg.content = [];
      if (text) {
        msg.content.push({ type: 'text/plain', value: text });
      }
      if (html) {
        msg.content.push({ type: 'text/html', value: html });
      }
    }

    // Add template ID and dynamic data if provided
    if (templateId) {
      msg.templateId = templateId;
    }
    if (dynamicTemplateData) {
      msg.dynamicTemplateData = dynamicTemplateData;
    }

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: "Welcome to Our Platform",
    templateId: "d-welcome-template-id", // Replace with your SendGrid template ID
  },
  passwordReset: {
    subject: "Reset Your Password",
    templateId: "d-password-reset-template-id",
  },
  twoFactorEnabled: {
    subject: "Two-Factor Authentication Enabled",
    templateId: "d-2fa-enabled-template-id",
  },
  twoFactorDisabled: {
    subject: "Two-Factor Authentication Disabled",
    templateId: "d-2fa-disabled-template-id",
  },
  newLogin: {
    subject: "New Login Detected",
    templateId: "d-new-login-template-id",
  },
  surveyInvitation: {
    subject: "You have a new survey to complete",
    templateId: "d-survey-invitation-template-id",
  },
  surveyReminder: {
    subject: "Reminder: Complete your survey",
    templateId: "d-survey-reminder-template-id",
  },
  surveyCompleted: {
    subject: "Survey Completed",
    templateId: "d-survey-completed-template-id",
  },
  clientInvitation: {
    subject: "You have been invited to join a company",
    templateId: "d-client-invitation-template-id",
  },
  companyInvitation: {
    subject: "Join our company on the platform",
    templateId: "d-company-invitation-template-id",
  },
}; 