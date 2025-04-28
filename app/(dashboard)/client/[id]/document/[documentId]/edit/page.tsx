"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileEdit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  email: z
    .string()
    .email({ message: "Invalid email address." })
    .optional()
    .or(z.literal("")),
  mobileNumber: z.string().optional().or(z.literal("")),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
  pin: z
    .string()
    .length(4, {
      message: "PIN must be exactly 4 digits.",
    })
    .regex(/^\d+$/, {
      message: "PIN must only contain digits.",
    }),
});

interface EditDocumentPageProps {
  params: {
    id: string;
    documentId: string;
  };

  searchParams: Record<string, string | string[] | undefined>;
}


export default function EditDocumentPage({params}: EditDocumentPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [documentData, setDocumentData] = useState<{
    _id: string;
    socialMedia: string;
    username: string;
    email?: string;
    mobileNumber?: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const router = useRouter();

    const { id: clientId, documentId } = params ;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      mobileNumber: "",
      password: "",
      pin: "",
    },
  });

  useEffect(() => {
    async function fetchDocument() {
      try {
        const response = await fetch(`/api/documents/${documentId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }

        const data = await response.json();
        setDocumentData(data.document);

        // Set form values
        form.setValue("username", data.document.username);
        if (data.document.email) form.setValue("email", data.document.email);
        if (data.document.mobileNumber)
          form.setValue("mobileNumber", data.document.mobileNumber);
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Failed to fetch document data");
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchDocument();
  }, [documentId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email || undefined,
          mobileNumber: values.mobileNumber || undefined,
          password: values.password,
          pin: values.pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update document");
      }

      toast.success("Credential updated successfully");
      router.push(`/client/${clientId}`);
      router.refresh();
    } catch (error) {
      console.error("Document update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update document"
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <div className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
          <p>Loading document data...</p>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <div className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
          <p>Document not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileEdit className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Edit Credential
            </CardTitle>
            <CardDescription className="text-center">
              Update credential for {documentData.socialMedia}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mobile number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="flex justify-center items-center gap-3">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                          />
                          <Button
                            variant={"outline"}
                            onClick={() => setShowPassword((prev) => !prev)}
                            type="button"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Enter a new password or leave unchanged and re-enter
                        current password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client PIN</FormLabel>
                      <FormControl>
                     
                        <div className="flex justify-center items-center gap-3">
                        <Input
                            type={showPin ? "text" : "password"}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            placeholder="Enter client's 4-digit PIN"
                            {...field}
                          /> 
                          <Button
                            variant={"outline"}
                            onClick={() => setShowPin((prev) => !prev)}
                            type="button"
                          >
                            {showPin ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Required to update the credential
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/client/${clientId}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Credential"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
