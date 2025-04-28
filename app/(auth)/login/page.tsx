"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EyeIcon, EyeOffIcon, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password1: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  password2: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

export default function LoginPage() {
  const [togglePass1, SettogglePass1] = useState(false);
  const [togglePass2, SettogglePass2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password1: "",
      password2: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      toast.success("Login successful");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      toast.error(
        error instanceof Error ? error.message : "Authentication failed"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-[350px] shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <LockKeyhole className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            DP&apos;s Password Manager
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password 1</FormLabel>
                    <FormControl>
                      <div className="flex justify-between items-center gap-3">
                        <Input
                          type={togglePass1 ? "text" : "password"}
                          placeholder="Enter password 1"
                          {...field}
                        />
                        {togglePass1 ? (
                          <Button
                            variant={"outline"}
                            type="button"
                            onClick={() => SettogglePass1(!togglePass1)}
                          >
                            <EyeIcon className="cursor-pointer" type="button" />
                          </Button>
                        ) : (
                          <Button
                            variant={"outline"}
                            type="button"
                            onClick={() => SettogglePass1(!togglePass1)}
                          >
                            <EyeOffIcon
                              className="cursor-pointer"
                              type="button"
                            />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password 2</FormLabel>
                    <FormControl>
                      <div className="flex justify-between items-center gap-3">
                        <Input
                          type={togglePass2 ? "text" : "password"}
                          placeholder="Enter password 2"
                          {...field}
                        />
                        {togglePass2 ? (
                          <Button
                            variant={"outline"}
                            type="button"
                            onClick={() => SettogglePass2(!togglePass2)}
                          >
                            <EyeIcon className="cursor-pointer" type="button" />
                          </Button>
                        ) : (
                          <Button
                            variant={"outline"}
                            type="button"
                            onClick={() => SettogglePass2(!togglePass2)}
                          >
                            <EyeOffIcon className="cursor-pointer" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Secure access to your password vault
        </CardFooter>
      </Card>
    </div>
  );
}
