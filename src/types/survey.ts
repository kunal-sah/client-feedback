export type Question = {
  id: string;
  title: string;
  type: string;
  options: string | null;
  required: boolean;
};

export type Survey = {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
  frequency: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  questions: Question[];
  responses: {
    id: string;
    createdAt: Date;
    answers: any;
    user: {
      id: string;
      name: string | null;
      email: string | null;
    };
  }[];
}; 