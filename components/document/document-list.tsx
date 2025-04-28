"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Eye, History } from "lucide-react";
import { IDocument } from "@/lib/db/models/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordDialog } from "@/components/document/password-dialog";
import { VersionHistoryDialog } from "@/components/document/version-history-dialog";
import { getSocialMediaIcon } from "@/lib/utils";

interface DocumentListProps {
  clientId: string;
  documents: IDocument[];
}

export function DocumentList({ clientId, documents }: DocumentListProps) {
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(null);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  function handleViewPassword(document: IDocument) {
    setSelectedDocument(document);
    setIsPasswordDialogOpen(true);
  }

  function handleViewHistory(document: IDocument) {
    setSelectedDocument(document);
    setIsHistoryDialogOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((document) => (
          <Card key={document._id?.toString()} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                {getSocialMediaIcon(document.socialMedia, "h-5 w-5 text-primary")}
                {document.socialMedia}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-sm font-medium">Username:</div>
                  <div className="col-span-2 text-sm">{document.username}</div>
                  
                  {document.email && (
                    <>
                      <div className="text-sm font-medium">Email:</div>
                      <div className="col-span-2 text-sm">{document.email}</div>
                    </>
                  )}
                  
                  {document.mobileNumber && (
                    <>
                      <div className="text-sm font-medium">Mobile:</div>
                      <div className="col-span-2 text-sm">{document.mobileNumber}</div>
                    </>
                  )}
                  
                  <div className="text-sm font-medium">Password:</div>
                  <div className="col-span-2 text-sm">••••••••</div>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewHistory(document)}
                >
                  <History className="h-4 w-4 mr-1" />
                  History
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPassword(document)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Link href={`/client/${clientId}/document/${document._id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <PasswordDialog
        document={selectedDocument}
        clientId={clientId}
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
      
      <VersionHistoryDialog
        document={selectedDocument}
        clientId={clientId}
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
      />
    </>
  );
}