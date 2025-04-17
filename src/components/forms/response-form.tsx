'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  text: string;
  type: "TEXT" | "RATING";
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  questions: Question[];
};

const answerSchema = z.object({
  questionId: z.string(),
  text: z.string().optional(),
  score: z.number().min(0).max(10).optional(),
});

const responseSchema = z.object({
  surveyId: z.string(),
  score: z.number().min(0).max(10).optional(),
  answers: z.array(answerSchema),
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface ResponseFormProps {
  survey: Survey;
}

export function ResponseForm({ survey }: ResponseFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      surveyId: survey.id,
      answers: survey.questions.map((question) => ({
        questionId: question.id,
        text: "",
        score: undefined,
      })),
    },
  });

  const onSubmit = async (data: ResponseFormData) => {
    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit response");
      }

      router.push("/responses");
      router.refresh();
    } catch (error) {
      setError("An error occurred while submitting your response. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">{survey.title}</h2>
        <p className="text-sm text-gray-500 mb-6">{survey.description}</p>

        {survey.questions.map((question, index) => (
          <div key={question.id} className="mb-6 last:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {index + 1}. {question.text}
            </label>
            
            {question.type === "TEXT" ? (
              <textarea
                {...register(`answers.${index}.text`)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                rows={3}
              />
            ) : (
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  {...register(`answers.${index}.score`, { valueAsNumber: true })}
                  min="0"
                  max="10"
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-500 min-w-[2rem] text-center">
                  {watch(`answers.${index}.score`) || 0}
                </span>
              </div>
            )}
            
            {errors.answers?.[index] && (
              <p className="mt-1 text-sm text-red-600">
                {errors.answers[index]?.message}
              </p>
            )}
          </div>
        ))}

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </button>
        </div>
      </div>
    </form>
  );
} 