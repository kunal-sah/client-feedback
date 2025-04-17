import { format } from "date-fns";
import { Survey, User, Question, Response, Answer } from "@prisma/client";
import { useSession } from "next-auth/react";
import { ResponseForm } from "./forms/response-form";

type SurveyWithRelations = Survey & {
  client: User;
  teamMember: User;
  questions: Question[];
  responses: (Response & {
    answers: Answer[];
    user: User;
  })[];
};

interface SurveyDetailProps {
  survey: SurveyWithRelations;
}

export function SurveyDetail({ survey }: SurveyDetailProps) {
  const { data: session } = useSession();

  const canRespond =
    session?.user.role === "CLIENT" && session.user.id === survey.clientId;

  const hasResponded = survey.responses.some(
    (response) => response.user.id === session?.user.id
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{survey.title}</h1>
        {survey.description && (
          <p className="mt-2 text-gray-500">{survey.description}</p>
        )}
        <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
          <p>Created {format(new Date(survey.createdAt), "MMM d, yyyy")}</p>
          <p>•</p>
          <p>
            Status:{" "}
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
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Survey Details
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Client</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {survey.client.name || survey.client.email}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Team Member</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {survey.teamMember.name || survey.teamMember.email}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                <dd className="mt-1 text-sm text-gray-900">{survey.frequency}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Trigger Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  Day {survey.triggerDate} of the month
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Response Summary
            </h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Total Responses
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {survey.responses.length}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Average Score
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {survey.responses.length > 0
                    ? (
                        survey.responses.reduce(
                          (acc, response) => acc + (response.score || 0),
                          0
                        ) / survey.responses.length
                      ).toFixed(1)
                    : "N/A"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {canRespond && !hasResponded && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Submit Your Response
            </h3>
            <div className="mt-5">
              <ResponseForm survey={survey} />
            </div>
          </div>
        </div>
      )}

      {survey.responses.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Previous Responses
            </h3>
          </div>
          <div className="border-t border-gray-200">
            <ul className="divide-y divide-gray-200">
              {survey.responses.map((response) => (
                <li key={response.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {response.user.name || response.user.email}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Submitted{" "}
                        {format(new Date(response.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    {response.score && (
                      <div className="ml-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Score: {response.score}
                        </span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 