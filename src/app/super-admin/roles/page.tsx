import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

async function getRoleTemplates() {
  const roleTemplates = await prisma.roleTemplate.findMany({
    include: {
      company: true,
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return roleTemplates;
}

export default async function RolesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const roleTemplates = await getRoleTemplates();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Roles & Permissions</h1>
        <Button>Create Role Template</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {roleTemplates.map((template) => (
          <Card key={template.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                <p className="text-gray-600 mb-4">{template.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="text-lg font-semibold">
                      {template.company?.name || "Global Template"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Users</p>
                    <p className="text-lg font-semibold">{template._count.users}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {template.permissions.map((permission: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline">Edit</Button>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 