import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/reservations")({
  head: () => ({
    meta: [
      { title: "حجوزاتي — قطّعتي" },
      { name: "description", content: "حجوزاتي في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "حجوزاتي — قطّعتي" },
      { property: "og:description", content: "حجوزاتي في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="حجوزاتي" />,
});
