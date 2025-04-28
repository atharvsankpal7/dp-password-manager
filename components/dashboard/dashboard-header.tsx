"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogOut, Plus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";

export function DashboardHeader() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Failed to log out');
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LockKeyhole className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">DP&apos;s Password Manager</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/client/new">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <UserPlus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </Link>
          <Link href="/dashboard" className="md:hidden">
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
          <ModeToggle />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}