'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { type User, type Survey, type Response } from "@prisma/client";

type TeamMember = User & {
  teamMemberSurveys: (Survey & {
    client: User;
    responses: Response[];
  })[];
};

export default function TeamPage() {
  const { data: session, status } = useSession();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/team");
        if (!response.ok) throw new Error("Failed to fetch team members");
        const data = await response.json();
        setTeamMembers(data);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTeamMembers();
    }
  }, [status]);

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <CardTitle>{member.name || member.email}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{member.email}</p>
                <p className="text-sm">
                  Active Surveys: {member.teamMemberSurveys.length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 