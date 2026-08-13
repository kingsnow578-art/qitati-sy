import icon from "@/assets/qitati-icon.png.asset.json";
import { TELEGRAM_URL } from "@/lib/links";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-deep/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={icon.url}
              alt="شعار قطّعتي"
              width={44}
              height={44}
              loading="lazy"
              className="h-11 w-11 rounded-xl"
            />
            <div>
              <p className="text-lg font-bold">قطّعتي</p>
              <p className="text-xs text-muted-foreground">Syrian Technology Marketplace</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
            منصة مجانية لبيع وشراء قطع الكمبيوتر والإلكترونيات في سوريا.
          </p>
        </div>

        <div className="text-sm">
          <p className="mb-4 font-semibold">روابط</p>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              <a href="#features" className="transition-colors hover:text-primary">
                المميزات
              </a>
            </li>
            <li>
              <a href="#download" className="transition-colors hover:text-primary">
                تحميل التطبيق
              </a>
            </li>
            <li>
              <a href="#how" className="transition-colors hover:text-primary">
                كيف يعمل
              </a>
            </li>
            <li>
              <a href="#faq" className="transition-colors hover:text-primary">
                الأسئلة الشائعة
              </a>
            </li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-4 font-semibold">المجتمع</p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 font-medium text-primary transition-colors hover:bg-primary/20"
          >
            انضم إلى مجموعة تلغرام
          </a>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} قطّعتي — Qitati. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
