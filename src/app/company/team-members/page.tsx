'use client';

import { useState } from 'react';
import { TeamMemberList } from '@/components/company/team-member-list';
import { TeamMemberForm } from '@/components/company/team-member-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_TEAM_MEMBER';
  createdAt: string;
}

export default function TeamMembersPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleEdit = (teamMember: TeamMember) => {
    setSelectedTeamMember(teamMember);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(
        selectedTeamMember
          ? `/api/team-members/${selectedTeamMember.id}`
          : '/api/team-members',
        {
          method: selectedTeamMember ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save team member');
      }

      setShowForm(false);
      setSelectedTeamMember(null);
      // Refresh the team member list
      // You would typically fetch the updated list here
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save team member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Team Members</h1>
      </div>
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTeamMember ? 'Edit Team Member' : 'Add Team Member'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TeamMemberForm
              initialData={selectedTeamMember || undefined}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      ) : (
        <TeamMemberList
          teamMembers={teamMembers}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
} 