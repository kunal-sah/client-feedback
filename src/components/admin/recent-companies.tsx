import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Company = Awaited<ReturnType<typeof prisma.company.findFirst>>;

interface RecentCompaniesProps {
  companies: (NonNullable<Company> & {
    _count: {
      users: number;
      clients: number;
      surveys: number;
    };
  })[];
}

export function RecentCompanies({ companies }: RecentCompaniesProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Users</TableHead>
          <TableHead>Clients</TableHead>
          <TableHead>Surveys</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell className="font-medium">{company.name}</TableCell>
            <TableCell>{company._count.users}</TableCell>
            <TableCell>{company._count.clients}</TableCell>
            <TableCell>{company._count.surveys}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 