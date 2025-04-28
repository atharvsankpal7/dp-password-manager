"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FileLock, ShoppingBagIcon } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const formSchema = z.object({
  socialMedia: z.string().min(1, {
    message: "Social media platform is required.",
  }),
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

const socialMediaOptions = [
  "Facebook",
  "Twitter",
  "Instagram",
  "LinkedIn",
  "GitHub",
  "YouTube",
  "Twitch",
  "Email",
  "Website",
  "Database",
  "Mobile",
  "Other",
];

interface NewDocumentPageProps {
  params: {
    id: string;
  };
}

export default async function NewDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string}>;
  searchParams: Promise<any>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const param = await params;

  const { id: clientId } = param;
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socialMedia: "",
      username: "",
      email: "",
      mobileNumber: "",
      password: "",
      pin: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/clients/${clientId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          socialMedia: values.socialMedia,
          username: values.username,
          email: values.email || undefined,
          mobileNumber: values.mobileNumber || undefined,
          password: values.password,
          pin: values.pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create document");
      }

      toast.success("Credential added successfully");
      router.push(`/client/${clientId}`);
      router.refresh();
    } catch (error) {
      console.error("Document creation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create document"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <div className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileLock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">
              Add New Credential
            </CardTitle>
            <CardDescription className="text-center">
              Add a new credential for this client
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
                  name="socialMedia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {socialMediaOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            placeholder="Enter password"
                            {...field}
                          />
                          <Button
                            variant={"outline"}
                            onClick={() => setShowPassword(!showPassword)}
                            type="button"
                          >
                            {showPassword ? (
                              <EyeIcon></EyeIcon>
                            ) : (
                              <EyeOffIcon></EyeOffIcon>
                            )}
                          </Button>
                        </div>
                      </FormControl>
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
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            placeholder="Enter client's 4-digit PIN"
                            {...field}
                          />
                          <Button
                            variant={"outline"}
                            onClick={() => setShowPin(!showPin)}
                            type="button"
                          >
                            {showPin ? (
                              <EyeIcon></EyeIcon>
                            ) : (
                              <EyeOffIcon></EyeOffIcon>
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Required to encrypt the password
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
                    {isLoading ? "Adding..." : "Add Credential"}
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
