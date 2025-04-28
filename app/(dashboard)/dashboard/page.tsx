import ClientList from '@/components/client/client-list';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import connectToDatabase from '@/lib/db/mongoose';
import Client from '@/lib/db/models/client';

export const dynamic = 'force-dynamic';

async function getClients() {
  await connectToDatabase();
  const clients = await Client.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(clients));
}

export default async function DashboardPage() {
  const clients = await getClients();

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        </div>
        <ClientList clients={clients} />
      </main>
    </div>
  );
}