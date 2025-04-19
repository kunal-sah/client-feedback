"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface CompanyDetails {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  userCount: number;
  clientCount: number;
  surveyCount: number;
  users: User[];
  clients: Client[];
}

export default function CompanyDetailsPage({
  params
}: {
  params: { id: string }
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editedCompany, setEditedCompany] = useState({
    name: '',
    status: ''
  });

  useEffect(() => {
    if (session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchCompanyDetails();
  }, [session, router, params.id]);

  const fetchCompanyDetails = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch company details');
      const data = await response.json();
      setCompany(data);
      setEditedCompany({
        name: data.name,
        status: data.status
      });
    } catch (error) {
      console.error('Error fetching company details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch company details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompany = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedCompany),
      });

      if (!response.ok) throw new Error('Failed to update company');

      const updatedCompany = await response.json();
      setCompany(updatedCompany);
      setShowEditDialog(false);

      toast({
        title: 'Success',
        description: 'Company updated successfully',
      });
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: 'Error',
        description: 'Failed to update company',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCompany = async () => {
    if (!confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete company');

      toast({
        title: 'Success',
        description: 'Company deleted successfully',
      });

      router.push('/admin/companies');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete company',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Company not found</h1>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/admin/companies')}
        >
          Back to Companies
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{company.name}</h1>
        <div className="space-x-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Company</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Company</DialogTitle>
                <DialogDescription>
                  Update company details and status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={editedCompany.name}
                    onChange={(e) => setEditedCompany({ ...editedCompany, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editedCompany.status}
                    onValueChange={(value) => setEditedCompany({ ...editedCompany, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateCompany}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleDeleteCompany}>
            Delete Company
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.userCount}</div>
            <p className="text-xs text-muted-foreground">
              Total team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.clientCount}</div>
            <p className="text-xs text-muted-foreground">
              Total clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Surveys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.surveyCount}</div>
            <p className="text-xs text-muted-foreground">
              Total surveys
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {company.clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 