"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IClient } from "@/lib/db/models/client";

interface ClientHeaderProps {
  client: IClient;
}

export function ClientHeader({ client }: ClientHeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-xl">{client.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/client/${client._id}/document/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Credential
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}