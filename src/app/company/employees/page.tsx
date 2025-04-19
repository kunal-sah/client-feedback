'use client';

import { useState } from 'react';
import { EmployeeList } from '@/components/company/employee-list';
import { EmployeeForm } from '@/components/company/employee-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'COMPANY_ADMIN' | 'COMPANY_TEAM_MEMBER';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(
        selectedEmployee
          ? `/api/employees/${selectedEmployee.id}`
          : '/api/employees',
        {
          method: selectedEmployee ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save employee');
      }

      setShowForm(false);
      setSelectedEmployee(null);
      // Refresh the employee list
      // You would typically fetch the updated list here
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save employee',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Employees</h1>
      </div>
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedEmployee ? 'Edit Employee' : 'Add Employee'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm
              initialData={selectedEmployee || undefined}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      ) : (
        <EmployeeList
          employees={employees}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
} 