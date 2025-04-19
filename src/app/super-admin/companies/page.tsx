import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getCompanies() {
  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          users: true,
          clients: true,
          surveys: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return companies;
}

export default async function CompaniesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const companies = await getCompanies();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Companies</h1>
        <Button>Add Company</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">{company.name}</h3>
                <p className="text-gray-600 mb-4">Status: {company.status}</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Users</p>
                    <p className="text-lg font-semibold">{company._count.users}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Clients</p>
                    <p className="text-lg font-semibold">{company._count.clients}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Surveys</p>
                    <p className="text-lg font-semibold">{company._count.surveys}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">Edit</Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  {company.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 