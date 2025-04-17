import Link from "next/link";
import { format } from "date-fns";
import { Survey, User, Question, Response, Answer } from "@prisma/client";

type SurveyWithRelations = Survey & {
  client: User;
  teamMember: User;
  questions: Question[];
  responses: (Response & {
    answers: Answer[];
  })[];
};

interface SurveyListProps {
  surveys: SurveyWithRelations[];
}

export function SurveyList({ surveys }: SurveyListProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {surveys.map((survey) => (
          <li key={survey.id}>
            <Link
              href={`/surveys/${survey.id}`}
              className="block hover:bg-gray-50"
            >
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {survey.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {survey.description || "No description"}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        survey.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : survey.status === "IN_PROGRESS"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {survey.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Client: {survey.client.name || survey.client.email}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Team Member: {survey.teamMember.name || survey.teamMember.email}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      Created{" "}
                      {format(new Date(survey.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
} 