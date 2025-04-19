'use client';

import { useSession } from "next-auth/react";
import { ResponseForm } from "./forms/response-form";
import { useToast } from "./ui/use-toast";
import { useState } from "react";

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "RATING";
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  client: {
    id: string;
    name: string | null;
    email: string;
  };
  teamMember: {
    id: string;
    name: string | null;
    email: string;
  };
  questions: Question[];
  responses: {
    id: string;
    createdAt: Date;
    score: number | null;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
    answers: {
      id: string;
      text: string | null;
      score: number | null;
    }[];
  }[];
};

interface SurveyDetailProps {
  survey: Survey;
}

export function SurveyDetail({ survey }: SurveyDetailProps) {
  const { data: session } = useSession();
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{survey.title}</h2>
        {survey.description && (
          <p className="text-gray-600 mt-2">{survey.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Client</h3>
          <p>{survey.client.name || survey.client.email}</p>
        </div>
        <div>
          <h3 className="font-semibold">Team Member</h3>
          <p>{survey.teamMember.name || survey.teamMember.email}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Questions</h3>
        <div className="space-y-4">
          {survey.questions.map((question) => (
            <div key={question.id} className="p-4 border rounded-lg">
              <p className="font-medium">{question.text}</p>
              <p className="text-sm text-gray-500">Type: {question.type}</p>
            </div>
          ))}
        </div>
      </div>

      {session?.user && (
        <div>
          <h3 className="font-semibold mb-4">Submit Response</h3>
          <ResponseForm survey={survey} />
        </div>
      )}

      {survey.responses.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Previous Responses</h3>
          <div className="space-y-4">
            {survey.responses.map((response) => (
              <div key={response.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <p>
                    {response.user.name || response.user.email} - {new Date(response.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 