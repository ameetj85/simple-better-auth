"use client";

import React, { useEffect } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [token, setToken] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (!tokenParam) {
      setError("Invalid or missing token.");
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (confirmPassword !== password) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    setLoading(true);

    if (!token && !error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <p>Loading...</p>
        </div>
      );
    }

    try {
      const { data, error } = await authClient.resetPassword(
        {
          newPassword: password, // user password -> min 8 characters by default
          token, // reset token from the email link
        },
        {
          onRequest: (ctx) => {
            //show loading
          },
          onSuccess: (ctx) => {
            setSuccess(true);
            // redirect to login after 2 seconds
            setTimeout(() => {
              router.push("/login");
            }, 2000);
          },
          onError: (ctx) => {
            // display the error message
            setError(ctx.error.message || "Failed to reset password.");
          },
        }
      );
    } catch (error) {
      setError("Failed to reset password.");
      console.error("Reset password error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password Page</CardTitle>
          <CardDescription>
            Enter your new password to reset your account password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !token}
            >
              {loading ? "Resetting password..." : "Reset Password"}
            </Button>
            <Button
              asChild
              variant="link"
              className="w-full"
              disabled={loading}
            >
              <Link href="/login">Back to Login</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
