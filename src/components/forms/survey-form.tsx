'use client';

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["TEXT", "NUMBER", "RATING", "BOOLEAN", "MULTIPLE_CHOICE"]),
  required: z.boolean().default(true),
  order: z.number().min(0),
});

const surveySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  frequency: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  triggerDate: z.number().min(1).max(31),
  clientId: z.string().min(1, "Client is required"),
  teamMemberId: z.string().min(1, "Team member is required"),
  questions: z.array(questionSchema),
});

type SurveyFormData = z.infer<typeof surveySchema>;

export function SurveyForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      questions: [
        {
          text: "How satisfied are you with the team member's performance this month?",
          type: "RATING",
          required: true,
          order: 0,
        },
        {
          text: "What went well?",
          type: "TEXT",
          required: true,
          order: 1,
        },
        {
          text: "What could be improved?",
          type: "TEXT",
          required: true,
          order: 2,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data: SurveyFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create survey");
      }

      toast({
        title: "Success",
        description: "Survey created successfully",
      });

      router.push("/surveys");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create survey. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Survey Title</Label>
          <Input
            id="title"
            placeholder="Enter survey title"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Enter survey description"
            {...register("description")}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <select
              {...register("frequency")}
              id="frequency"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="triggerDate">Trigger Date (1-31)</Label>
            <Input
              {...register("triggerDate", { valueAsNumber: true })}
              type="number"
              id="triggerDate"
              min="1"
              max="31"
              placeholder="Enter trigger date"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Questions</h3>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-4">
                <div className="flex-1 space-y-2">
                  <Input
                    {...register(`questions.${index}.text`)}
                    placeholder="Enter question text"
                    className="w-full"
                  />
                  <select
                    {...register(`questions.${index}.type`)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="RATING">Rating</option>
                    <option value="BOOLEAN">Yes/No</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  text: "",
                  type: "TEXT",
                  required: true,
                  order: fields.length,
                })
              }
            >
              Add Question
            </Button>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Survey"}
      </Button>
    </form>
  );
} 