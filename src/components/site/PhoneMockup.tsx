import screen from "@/assets/app-screen.jpg";

export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[270px] sm:w-[300px]">
      <div className="absolute -inset-10 rounded-full bg-primary/25 blur-3xl animate-pulse-glow" />
      <div className="relative animate-float-soft rounded-[2.6rem] border border-primary/40 bg-card p-2.5 glow-ring">
        <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-deep" />
        <img
          src={screen}
          alt="لقطة من تطبيق قطّعتي تعرض قطع الكمبيوتر المعروضة للبيع"
          width={720}
          height={1440}
          className="rounded-[2.1rem] object-cover"
        />
      </div>
    </div>
  );
}
