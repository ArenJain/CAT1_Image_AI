"use client";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthForm mode="register" />
    </div>
  );
}
