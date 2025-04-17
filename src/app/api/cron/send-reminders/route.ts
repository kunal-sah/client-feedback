import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSurveyEmail } from "@/lib/email";
import { addDays, isSameDay } from "date-fns";

export async function GET(req: Request) {
  try {
    // Verify cron secret to ensure this is a legitimate request
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const today = new Date();
    const tomorrow = addDays(today, 1);

    // Find surveys that need reminders
    const surveys = await prisma.survey.findMany({
      where: {
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
        triggerDate: today.getDate(),
      },
      include: {
        client: true,
        teamMember: true,
      },
    });

    // Send reminders for each survey
    const emailPromises = surveys.map(async (survey) => {
      const lastResponse = await prisma.response.findFirst({
        where: {
          surveyId: survey.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // If no response yet, send initial reminder
      if (!lastResponse) {
        return sendSurveyEmail({
          to: survey.client.email,
          surveyId: survey.id,
          teamMemberName: survey.teamMember.name || "Team Member",
          clientName: survey.client.name || "Client",
        });
      }

      // If response exists, check if we need to send follow-up reminders
      const responseDate = new Date(lastResponse.createdAt);
      const daysSinceResponse = Math.floor(
        (today.getTime() - responseDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Send follow-up reminders if needed
      if (daysSinceResponse >= 2) {
        return sendSurveyEmail({
          to: survey.client.email,
          surveyId: survey.id,
          teamMemberName: survey.teamMember.name || "Team Member",
          clientName: survey.client.name || "Client",
        });
      }
    });

    await Promise.all(emailPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CRON_SEND_REMINDERS]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 