import { notFound } from "next/navigation";
import { DocumentList } from "@/components/document/document-list";
import { ClientHeader } from "@/components/client/client-header";
import connectToDatabase from "@/lib/db/mongoose";
import Client from "@/lib/db/models/client";
import Document from "@/lib/db/models/document";

export const dynamic = 'force-dynamic';

interface ClientPageProps {
  params: {
    id: string;
  };
}

async function getClientData(id: string) {
  await connectToDatabase();
  
  const client = await Client.findById(id);
  
  if (!client) {
    return null;
  }
  
  const documents = await Document.find({ 
    clientId: id,
    isActive: true,
  }).sort({ socialMedia: 1 });
  
  return {
    client: JSON.parse(JSON.stringify(client)),
    documents: JSON.parse(JSON.stringify(documents)),
  };
}

export default async function ClientPage({ params }: ClientPageProps) {
  const data = await getClientData(params.id);
  
  if (!data) {
    notFound();
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <ClientHeader client={data.client} />
      <div className="container mx-auto p-4 md:p-6">
        <DocumentList clientId={params.id} documents={data.documents} />
      </div>
    </div>
  );
}