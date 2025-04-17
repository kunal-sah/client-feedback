import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY is not set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface SendSurveyEmailParams {
  to: string;
  surveyId: string;
  teamMemberName: string;
  clientName: string;
}

export async function sendSurveyEmail({
  to,
  surveyId,
  teamMemberName,
  clientName,
}: SendSurveyEmailParams) {
  const surveyUrl = `${process.env.NEXTAUTH_URL}/surveys/${surveyId}`;

  const msg = {
    to,
    from: process.env.EMAIL_FROM!,
    subject: `Monthly Feedback Survey for ${teamMemberName}`,
    text: `Hello ${clientName},\n\nThis is a reminder to complete the monthly feedback survey for ${teamMemberName}. Your feedback is important to us and helps us ensure we're providing the best service possible.\n\nPlease click the following link to complete the survey: ${surveyUrl}\n\nThank you for your time and feedback.\n\nBest regards,\nThe Team`,
    html: `
      <div>
        <h2>Monthly Feedback Survey</h2>
        <p>Hello ${clientName},</p>
        <p>This is a reminder to complete the monthly feedback survey for <strong>${teamMemberName}</strong>. Your feedback is important to us and helps us ensure we're providing the best service possible.</p>
        <p>Please click the button below to complete the survey:</p>
        <a href="${surveyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Complete Survey
        </a>
        <p>Thank you for your time and feedback.</p>
        <p>Best regards,<br>The Team</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
} 