'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Pencil, Trash, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_TEAM_MEMBER';
  createdAt: string;
}

interface TeamMemberListProps {
  teamMembers: TeamMember[];
  onEdit?: (teamMember: TeamMember) => void;
}

export function TeamMemberList({ teamMembers, onEdit }: TeamMemberListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (teamMemberId: string) => {
    try {
      const response = await fetch(`/api/team-members/${teamMemberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete team member');
      }

      toast({
        title: 'Success',
        description: 'Team member deleted successfully',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete team member',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/company/team-members/new">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((teamMember) => (
              <TableRow key={teamMember.id}>
                <TableCell className="font-medium">{teamMember.name}</TableCell>
                <TableCell>{teamMember.email}</TableCell>
                <TableCell>{teamMember.role}</TableCell>
                <TableCell>
                  {format(new Date(teamMember.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(teamMember)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(teamMember.id)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 