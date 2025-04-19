"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface SurveyWithRelations {
  id: string;
  title: string;
  description: string | null;
  status: string;
  frequency: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: string;
  userId: string;
  companyId: string;
  client: {
    id: string;
    name: string;
    email: string;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  company: {
    id: string;
    name: string;
  } | null;
  questions: Array<{
    id: string;
    title: string;
    type: string;
    options: string | null;
    required: boolean;
  }>;
  Response: Array<{
    id: string;
    createdAt: Date;
    answers: any;
  }>;
}

interface SurveyListProps {
  surveys: SurveyWithRelations[];
}

export function SurveyList({ surveys }: SurveyListProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (surveyId: string) => {
    try {
      const response = await fetch(`/api/surveys/${surveyId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete survey");
      }

      toast({
        title: "Success",
        description: "Survey deleted successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete survey",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div>
            <h3 className="text-lg font-semibold">{survey.title}</h3>
            <p className="text-sm text-gray-500">
              Client: {survey.client?.name || "Not assigned"}
            </p>
            <p className="text-sm text-gray-500">
              Created: {format(new Date(survey.createdAt), "PPP")}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/surveys/${survey.id}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
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
        </div>
      ))}
    </div>
  );
} 