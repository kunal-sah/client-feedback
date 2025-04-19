"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { ClientList } from "@/components/company/client-list"
import { ClientForm } from "@/components/company/client-form"

interface TeamMember {
  id: string
  name: string
  email: string
}

interface Client {
  id: string
  name: string
  email: string
  status: "ACTIVE" | "INACTIVE"
  teamMemberId?: string
}

export default function ClientsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | undefined>()
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== "COMPANY_ADMIN") {
      router.push("/dashboard")
      return
    }

    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/company/team-members")
        if (!response.ok) throw new Error("Failed to fetch team members")
        const data = await response.json()
        setTeamMembers(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeamMembers()
  }, [session, router, toast])

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setShowForm(true)
  }

  const handleSuccess = () => {
    setShowForm(false)
    setSelectedClient(undefined)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Management</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Create Client</Button>
        )}
      </div>

      {showForm ? (
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedClient ? "Edit Client" : "Create Client"}
          </h2>
          <ClientForm
            client={selectedClient}
            teamMembers={teamMembers}
            onCancel={() => {
              setShowForm(false)
              setSelectedClient(undefined)
            }}
            onSuccess={handleSuccess}
          />
        </div>
      ) : (
        <ClientList onEdit={handleEdit} />
      )}
    </div>
  )
} 