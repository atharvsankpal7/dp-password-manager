"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IClient } from "@/lib/db/models/client";
import { toast } from "sonner";

interface ClientAuthDialogProps {
  client: IClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientAuthDialog({ client, open, onOpenChange }: ClientAuthDialogProps) {
  const router = useRouter();
  const [pin, setPin] = useState(["", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

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

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    // Move back on backspace if empty
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!client) return;
    setError("");
    
    const fullPin = pin.join("");
    if (fullPin.length !== 4) {
      setError("Please enter a 4-digit PIN");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/clients/${client._id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin: fullPin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid PIN");
      }

      // Store pin in session storage for password decryption
      sessionStorage.setItem(`client_pin_${client._id}`, fullPin);
      
      toast.success("Access granted");
      router.push(`/client/${client._id}`);
      onOpenChange(false);
    } catch (error) {
      console.error("Authentication error:", error);
      setError(error instanceof Error ? error.message : "Invalid PIN");
      // Clear PIN on error
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
          <DialogTitle>Enter Client PIN</DialogTitle>
          <DialogDescription>
            Please enter the 4-digit PIN to access credentials for {client?.name}
          </DialogDescription>
        </DialogHeader>
        
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
              {isLoading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}