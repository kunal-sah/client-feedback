import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/super-admin/user-form";

async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      company: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return users;
}

async function getCompanies() {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc'
    }
  });

  return companies;
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const [users, companies] = await Promise.all([
    getUsers(),
    getCompanies()
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <UserForm mode="create" companies={companies} />
        
        {users.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">{user.name}</h3>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <p className="text-gray-600 mb-4">
                  Company: {user.company?.name || "No Company"}
                </p>
                
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="text-lg font-semibold">{user.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-semibold capitalize">
                      {user.emailVerified ? "Verified" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <UserForm mode="edit" user={user} companies={companies} />
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Deactivate
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 