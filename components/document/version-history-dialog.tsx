"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IDocument } from "@/lib/db/models/document";
import { format } from "date-fns";
import { IDocumentVersion } from "@/lib/db/models/documentVersion";
import { EyeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordDialog } from "./password-dialog";

interface VersionHistoryDialogProps {
  document: IDocument | null;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VersionHistoryDialog({
  document,
  clientId,
  open,
  onOpenChange,
}: VersionHistoryDialogProps) {
  const [versions, setVersions] = useState<IDocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedVersion, setSelectedVersion] =
    useState<IDocumentVersion | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    if (open && document) {
      fetchVersionHistory();
    }
  }, [open, document]);

  async function fetchVersionHistory() {
    if (!document) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/documents/${document._id}/versions`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch version history");
      }

      setVersions(data.versions);
    } catch (error) {
      console.error("Error fetching version history:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch version history"
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenPasswordDialog = (version: IDocumentVersion) => {
    setSelectedVersion(version);
    setShowPasswordDialog(true);
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    setSelectedVersion(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Version History - {document?.socialMedia}</DialogTitle>
        </DialogHeader>

        <Separator className="my-2" />

        {isLoading ? (
          <div className="flex justify-center p-6">
            <p>Loading version history...</p>
          </div>
        ) : error ? (
          <div className="text-destructive text-center p-4">{error}</div>
        ) : versions.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No previous versions found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Modified</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Password</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium">
                    {format(new Date(version.createdAt), "MMM d, yyyy h:mm a")}
                  </TableCell>
                  <TableCell>{version.username}</TableCell>
                  <TableCell>{version.email || "-"}</TableCell>
                  <TableCell>{version.mobileNumber || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-3">
                      <span>{"•••••••••"} </span>

                      <Button
                        variant={"outline"}
                        size="icon"
                        onClick={() => handleOpenPasswordDialog(version)}
                      >
                        <EyeIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      {selectedVersion && (
        <PasswordDialog
          document={selectedVersion}
          clientId={clientId}
          open={showPasswordDialog}
          onOpenChange={handleClosePasswordDialog}
        />
      )}
    </Dialog>
  );
}
