import { Link } from "@tanstack/react-router";
import { LockKeyhole } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card px-4 py-3.5 flex items-center justify-between shadow-md">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-extrabold truncate">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </header>
  );
}

export function SignInPrompt({ message }: { message: string }) {
  return (
    <div className="animate-scale-in mx-4 mt-10 rounded-3xl border border-border bg-card p-8 text-center">
      <div className="gradient-primary mx-auto flex size-14 items-center justify-center rounded-2xl text-primary-foreground">
        <LockKeyhole className="size-6" />
      </div>
      <p className="mt-4 text-sm font-semibold">{message}</p>
      <Link
        to="/auth"
        className="press gradient-primary shadow-glow mt-5 inline-flex rounded-xl px-6 py-2.5 text-sm font-bold text-primary-foreground"
      >
        تسجيل الدخول / حساب جديد
      </Link>
    </div>
  );
}
