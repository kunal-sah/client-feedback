import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CompanyForm } from "@/components/forms/company-form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Company {
  id: string;
  name: string;
  subscriptionTier: "FREE" | "BASIC" | "PREMIUM" | "ENTERPRISE";
  subscriptionStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  _count: {
    users: number;
    surveys: number;
    clients: number;
  };
}

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/admin/companies");
      if (!response.ok) throw new Error("Failed to fetch companies");
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch companies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      const response = await fetch(`/api/admin/companies?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete company");

      toast({
        title: "Success",
        description: "Company deleted successfully",
      });

      fetchCompanies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Companies</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Company</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <CompanyForm
              onSuccess={() => {
                setIsDialogOpen(false);
                fetchCompanies();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Subscription</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Surveys</TableHead>
            <TableHead>Clients</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell>{company.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{company.subscriptionTier}</Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    company.subscriptionStatus === "ACTIVE"
                      ? "success"
                      : company.subscriptionStatus === "SUSPENDED"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {company.subscriptionStatus}
                </Badge>
              </TableCell>
              <TableCell>{company._count.users}</TableCell>
              <TableCell>{company._count.surveys}</TableCell>
              <TableCell>{company._count.clients}</TableCell>
              <TableCell>
                {format(new Date(company.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(company.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 