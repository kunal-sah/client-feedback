import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const clients = await prisma.user.findMany({
    where: {
      role: "CLIENT",
    },
    include: {
      clientSurveys: {
        include: {
          teamMember: true,
          responses: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        {session.user.role === "ADMIN" && (
          <Button>Add Client</Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{client.name || client.email}</CardTitle>
                <p className="text-sm text-muted-foreground">{client.email}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Surveys</span>
                  <span className="font-medium">{client.clientSurveys.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium">
                    {client.clientSurveys.filter(s => s.status === "COMPLETED").length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-medium">
                    {client.clientSurveys.filter(s => s.status === "IN_PROGRESS").length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
} 