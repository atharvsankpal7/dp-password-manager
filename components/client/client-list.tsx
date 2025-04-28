"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCog, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ClientAuthDialog } from "@/components/client/client-auth-dialog";
import { IClient } from "@/lib/db/models/client";

interface ClientListProps {
  clients: IClient[];
}

export default function ClientList({ clients }: ClientListProps) {
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  function handleClientClick(client: IClient) {
    setSelectedClient(client);
    setIsAuthDialogOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <Card 
            key={client.id}
            className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer"
            onClick={() => handleClientClick(client)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                {client.name}
              </CardTitle>
              <CardDescription>
                Manage credentials
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4 pb-6 text-sm text-muted-foreground">
              Protected by 4-digit PIN
            </CardFooter>
          </Card>
        ))}

        <Link href="/client/new">
          <Card className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer h-full flex flex-col items-center justify-center p-6 border-dashed">
            <Plus className="h-10 w-10 text-muted-foreground mb-4" />
            <Button variant="outline">Add New Client</Button>
          </Card>
        </Link>
      </div>

      <ClientAuthDialog 
        client={selectedClient}
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
      />
    </>
  );
}