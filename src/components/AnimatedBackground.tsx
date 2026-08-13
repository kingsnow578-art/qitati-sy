const particles = [
  { left: "8%", top: "18%", size: 6, delay: "0s", dur: "9s" },
  { left: "22%", top: "72%", size: 4, delay: "1.4s", dur: "11s" },
  { left: "38%", top: "34%", size: 3, delay: "2.2s", dur: "8s" },
  { left: "54%", top: "62%", size: 5, delay: "0.8s", dur: "12s" },
  { left: "68%", top: "22%", size: 4, delay: "3s", dur: "10s" },
  { left: "82%", top: "56%", size: 6, delay: "1.1s", dur: "13s" },
  { left: "91%", top: "12%", size: 3, delay: "2.6s", dur: "9.5s" },
  { left: "14%", top: "48%", size: 3, delay: "3.4s", dur: "10.5s" },
];

export function AnimatedBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 hero-bg" />
      <div className="absolute inset-0 grid-veil opacity-60" />
      <div className="absolute -left-40 top-10 h-[38rem] w-[38rem] rounded-full bg-primary/12 blur-[130px] animate-drift" />
      <div
        className="absolute -right-32 top-1/3 h-[34rem] w-[34rem] rounded-full bg-accent/12 blur-[130px] animate-drift"
        style={{ animationDelay: "5s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-[140px] animate-drift"
        style={{ animationDelay: "9s" }}
      />
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-glow/70 animate-float-soft"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur,
            boxShadow: "0 0 14px 3px color-mix(in oklab, var(--glow) 60%, transparent)",
          }}
        />
      ))}
    </div>
  );
}
