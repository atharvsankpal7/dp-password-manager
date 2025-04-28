"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IDocument } from "@/lib/db/models/document";
import { toast } from "sonner";
import { IDocumentVersion } from "@/lib/db/models/documentVersion";

interface PasswordDialogProps {
  document: IDocument | IDocumentVersion | null;
  clientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PasswordDialog({
  document,
  clientId,
  open,
  onOpenChange,
}: PasswordDialogProps) {
  const [pin, setPin] = useState(["", "", "", ""]);
  const [password, setPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef<HTMLDivElement>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const isVersion =
    (document as IDocumentVersion)?.documentId !== undefined ? "versions/" : "";

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setPin(["", "", "", ""]);
      setPassword(null);
      setError("");
    }
  }, [open]);

  // Auto-focus first input when dialog opens
  useEffect(() => {
    if (open && inputRefs[0].current) {
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [open]);

  function handlePinChange(index: number, value: string) {
    if (value.length > 1) {
      value = value.charAt(0);
    }

    if (value && /^\d+$/.test(value)) {
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);

      // Move to next input
      if (index < 3 && value) {
        inputRefs[index + 1].current?.focus();
      }
    } else if (value === "") {
      const newPin = [...pin];
      newPin[index] = "";
      setPin(newPin);
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    // Move back on backspace if empty
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!document) return;
    setError("");

    const fullPin = pin.join("");
    if (fullPin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setIsLoading(true);

    try {
      // Try to use stored PIN first
      const storedPin = sessionStorage.getItem(`client_pin_${clientId}`);

      // If stored PIN doesn't match current PIN and stored PIN exists, verify first
      if (storedPin !== fullPin && storedPin) {
        const verifyResponse = await fetch(`/api/clients/${clientId}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pin: fullPin }),
        });

        if (!verifyResponse.ok) {
          throw new Error("Invalid PIN");
        }

        // Update stored PIN if verification passes
        sessionStorage.setItem(`client_pin_${clientId}`, fullPin);
      }
      const backendUrl = `/api/documents/${isVersion}${document._id}/password`
      console.log()
      const response = await fetch(
        `${backendUrl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pin: fullPin }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to decrypt password");
      }

      setPassword(data.password);
    } catch (error) {
      console.error("Decryption error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to decrypt password"
      );
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>View Password</DialogTitle>
          <DialogDescription>
            Enter your 4-digit PIN to view the password for{" "}
            {document?.socialMedia}
          </DialogDescription>
        </DialogHeader>

        {!password ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="pin-input focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-destructive text-center text-sm">{error}</p>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Decrypting..." : "View Password"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="rounded-md bg-muted/50 p-4">
              <div
                className="font-mono text-sm password-scroll"
                ref={passwordRef}
              >
                {password}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  try {
                    navigator.clipboard.writeText(password);
                    toast.success("Password copied to clipboard");
                  } catch (err) {
                    console.error("Failed to copy: ", err);
                    toast.error("Failed to copy password");
                  }
                }}
              >
                Copy Password
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
