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
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Pencil, Trash, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  frequency: 'ONCE' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  startDate: string;
  client: {
    id: string;
    name: string;
  };
  teamMember: {
    id: string;
    name: string;
  };
  _count: {
    responses: number;
  };
}

interface SurveyListProps {
  surveys: Survey[];
  onEdit?: (survey: Survey) => void;
}

const statusColors = {
  DRAFT: 'bg-gray-500',
  ACTIVE: 'bg-green-500',
  COMPLETED: 'bg-blue-500',
  ARCHIVED: 'bg-yellow-500',
};

export function SurveyList({ surveys, onEdit }: SurveyListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete survey');
      }

      toast({
        title: 'Success',
        description: 'Survey deleted successfully',
      });

      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete survey',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/surveys/new">
            Create Survey
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Team Member</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responses</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map((survey) => (
              <TableRow key={survey.id}>
                <TableCell className="font-medium">{survey.title}</TableCell>
                <TableCell>{survey.client.name}</TableCell>
                <TableCell>{survey.teamMember.name}</TableCell>
                <TableCell>{survey.frequency}</TableCell>
                <TableCell>
                  {format(new Date(survey.startDate), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={statusColors[survey.status]}
                  >
                    {survey.status}
                  </Badge>
                </TableCell>
                <TableCell>{survey._count.responses}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit?.(survey)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/surveys/${survey.id}/analytics`}>
                          <BarChart2 className="mr-2 h-4 w-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(survey.id)}
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