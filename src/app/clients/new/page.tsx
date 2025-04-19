'use client';

import { useRouter } from "next/navigation";
import { ClientForm } from "@/components/forms/client-form";

export default function NewClientPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    router.push("/clients");
    router.refresh();
  };

  return (
    <div className="container mx-auto py-10">
      <ClientForm onSubmit={handleSubmit} />
    </div>
  );
} 