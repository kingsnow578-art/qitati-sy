import { createFileRoute } from "@tanstack/react-router";
import {
  Cpu,
  Download,
  MessagesSquare,
  Search,
  Megaphone,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Send,
} from "lucide-react";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PhoneMockup } from "@/components/site/PhoneMockup";
import { APK_URL, APP_VERSION, TELEGRAM_URL } from "@/lib/links";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "قطّعتي | Qitati — سوق التكنولوجيا السوري" },
      {
        name: "description",
        content:
          "قطّعتي منصة مجانية لبيع وشراء قطع الكمبيوتر والإلكترونيات في سوريا. حمّل تطبيق أندرويد الآن مجاناً.",
      },
      { property: "og:title", content: "قطّعتي | سوق التكنولوجيا السوري" },
      {
        property: "og:description",
        content: "منصة مجانية لبيع وشراء قطع الكمبيوتر والإلكترونيات في سوريا.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Cpu, title: "بيع وشراء قطع الكمبيوتر بسهولة", desc: "اعرض قطعك أو اعثر على ما تحتاجه خلال دقائق، بواجهة بسيطة وسريعة." },
  { icon: MapPin, title: "سوق تقني مخصص لسوريا", desc: "منصة محلية بالكامل تجمع البائعين والمشترين في كل المحافظات السورية." },
  { icon: MessagesSquare, title: "التواصل بين البائع والمشتري", desc: "تواصل مباشر وواضح للاتفاق على السعر والتسليم دون وسطاء." },
  { icon: Search, title: "البحث عن المنتجات التقنية بسرعة", desc: "بحث ذكي وتصنيفات دقيقة تصل بك إلى القطعة المناسبة فوراً." },
  { icon: Megaphone, title: "نشر الإعلانات بسهولة", desc: "أضف صور ووصف وسعر واحصل على إعلان احترافي بضغطة واحدة." },
  { icon: ShieldCheck, title: "مجاني بالكامل", desc: "لا رسوم ولا اشتراكات — التطبيق مجاني لكل المستخدمين." },
];

const steps = [
  { n: "01", title: "حمّل التطبيق", desc: "نزّل ملف APK وثبّته على هاتف أندرويد خلال ثوانٍ." },
  { n: "02", title: "تصفّح أو انشر", desc: "ابحث عن القطعة التي تريدها أو انشر إعلانك مجاناً." },
  { n: "03", title: "تواصل وأتمم الصفقة", desc: "اتفق مباشرة مع الطرف الآخر وأنهِ عملية البيع أو الشراء." },
];

const faqs = [
  { q: "هل التطبيق مجاني؟", a: "نعم، قطّعتي مجاني بالكامل للبيع والشراء ونشر الإعلانات." },
  { q: "كيف أثبّت ملف APK؟", a: "بعد التحميل، افتح الملف واسمح بالتثبيت من مصادر غير معروفة، ثم اضغط تثبيت." },
  { q: "هل يوجد نسخة آيفون؟", a: "حالياً التطبيق متاح لأجهزة أندرويد، ونعمل على توسيع الدعم مستقبلاً." },
  { q: "كيف أتواصل مع الدعم؟", a: "عبر مجموعة تلغرام الرسمية، حيث يتواجد الفريق والمستخدمون." },
];

function Index() {
  return (
    <div id="top" dir="rtl" lang="ar" className="relative min-h-screen">
      <AnimatedBackground />
      <Header />

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-5 pb-24 pt-16 md:pt-24">
          <div className="grid items-center gap-14 md:grid-cols-2">
            <div className="animate-rise">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                قطّعتي — Qitati
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-[1.2] sm:text-5xl md:text-6xl">
                سوق التكنولوجيا <span className="text-gradient">السوري</span>
              </h1>
              <p className="mt-3 text-sm font-medium tracking-[0.2em] text-primary/80">
                SYRIAN TECHNOLOGY MARKETPLACE
              </p>
              <p className="mt-5 max-w-lg text-base leading-8 text-muted-foreground">
                منصة مجانية لبيع وشراء قطع الكمبيوتر والإلكترونيات في سوريا.
              </p>

              <div className="mt-9 flex flex-wrap gap-4">
                <a
                  href={APK_URL}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-l from-accent to-primary px-7 py-3.5 font-bold text-primary-foreground glow-ring transition-transform hover:scale-[1.03]"
                >
                  <Download className="h-5 w-5" />
                  تحميل التطبيق
                  <span className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12 bg-white/25 opacity-0 transition-opacity group-hover:opacity-100 group-hover:[animation:sheen_0.9s_ease-out]" />
                </a>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-7 py-3.5 font-semibold text-primary transition-colors hover:bg-primary/15"
                >
                  <Send className="h-5 w-5" />
                  انضم إلى مجموعة تلغرام
                </a>
              </div>

              <dl className="mt-12 grid max-w-md grid-cols-3 gap-4 text-center">
                {[
                  ["مجاني", "بلا رسوم"],
                  ["أندرويد", "APK مباشر"],
                  ["سوريا", "سوق محلي"],
                ].map(([a, b]) => (
                  <div key={a} className="glass rounded-2xl px-3 py-4">
                    <dt className="text-lg font-bold text-primary">{a}</dt>
                    <dd className="mt-1 text-xs text-muted-foreground">{b}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="animate-rise" style={{ animationDelay: "0.15s" }}>
              <PhoneMockup />
            </div>
          </div>
        </section>

        {/* DOWNLOAD */}
        <section id="download" className="mx-auto max-w-5xl px-5 py-20">
          <div className="glass relative overflow-hidden rounded-[2rem] p-8 sm:p-12">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl animate-pulse-glow" />
            <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
              <div>
                <h2 className="text-3xl font-extrabold sm:text-4xl">تحميل تطبيق قطّعتي</h2>
                <p className="mt-3 text-muted-foreground">ثبّت التطبيق على هاتفك وابدأ البيع والشراء فوراً.</p>
                <ul className="mt-7 grid gap-3 sm:grid-cols-2">
                  {[
                    [Smartphone, "تطبيق أندرويد APK"],
                    [ShieldCheck, "تطبيق مجاني بالكامل"],
                    [Sparkles, `أحدث إصدار ${APP_VERSION}`],
                    [Download, "تثبيت سهل وسريع"],
                  ].map(([Icon, label]) => {
                    const I = Icon as typeof Download;
                    return (
                      <li key={label as string} className="flex items-center gap-3 text-sm">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                          <I className="h-4.5 w-4.5" />
                        </span>
                        {label as string}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <a
                href={APK_URL}
                className="inline-flex flex-col items-center justify-center gap-1 rounded-3xl bg-gradient-to-b from-primary to-accent px-10 py-8 text-center font-extrabold text-primary-foreground glow-ring transition-transform hover:scale-[1.04]"
              >
                <Download className="h-8 w-8" />
                <span className="text-xl">تحميل APK</span>
                <span className="text-xs font-medium opacity-80">مجاناً • أندرويد</span>
              </a>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              لماذا <span className="text-gradient">قطّعتي</span>؟
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              كل ما تحتاجه لسوق تقني سوري حديث، في تطبيق واحد.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <article
                key={title}
                className="glass group rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/45 hover:shadow-[0_28px_70px_-30px_var(--glow)]"
              >
                <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary/12 p-3.5 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mt-2.5 text-sm leading-7 text-muted-foreground">{desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-extrabold sm:text-4xl">كيف يعمل التطبيق</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass rounded-3xl p-8">
                <span className="text-4xl font-black text-primary/35">{s.n}</span>
                <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
          <h2 className="text-center text-3xl font-extrabold sm:text-4xl">الأسئلة الشائعة</h2>
          <div className="mt-12 space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="glass group rounded-2xl p-6 [&_summary]:cursor-pointer">
                <summary className="flex list-none items-center justify-between font-semibold">
                  {f.q}
                  <span className="text-primary transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-5xl px-5 pb-24">
          <div className="glass relative overflow-hidden rounded-[2rem] p-10 text-center">
            <div className="absolute inset-x-0 -bottom-24 h-56 bg-primary/15 blur-3xl animate-pulse-glow" />
            <h2 className="relative text-2xl font-extrabold sm:text-3xl">جاهز لتبدأ؟</h2>
            <p className="relative mt-3 text-muted-foreground">
              حمّل قطّعتي وانضم إلى مجتمع التقنية السوري اليوم.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-4">
              <a
                href={APK_URL}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-l from-accent to-primary px-7 py-3.5 font-bold text-primary-foreground glow-ring transition-transform hover:scale-[1.03]"
              >
                <Download className="h-5 w-5" />
                تحميل التطبيق
              </a>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/5 px-7 py-3.5 font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                <Send className="h-5 w-5" />
                مجموعة تلغرام
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
