import icon from "@/assets/qitati-icon.png.asset.json";
import { TELEGRAM_URL } from "@/lib/links";

const nav = [
  { href: "#features", label: "المميزات" },
  { href: "#download", label: "التحميل" },
  { href: "#how", label: "كيف يعمل" },
  { href: "#faq", label: "الأسئلة" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-deep/70 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <a href="#top" className="flex items-center gap-3">
          <img
            src={icon.url}
            alt="شعار تطبيق قطّعتي"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-bold">قطّعتي</span>
            <span className="text-[11px] tracking-wide text-muted-foreground">Qitati</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          {nav.map((n) => (
            <a key={n.href} href={n.href} className="transition-colors hover:text-primary">
              {n.label}
            </a>
          ))}
        </nav>

        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          تلغرام
        </a>
      </div>
    </header>
  );
}
