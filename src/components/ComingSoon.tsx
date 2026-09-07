import { Link } from "@tanstack/react-router";
import { Construction } from "lucide-react";

export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
      <Construction className="h-12 w-12 text-primary" />
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground max-w-sm">
        {note ?? "هذه الصفحة قيد الإنشاء وسيتم تفعيلها قريباً."}
      </p>
      <Link to="/app" className="text-primary underline underline-offset-4">
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
