import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/seller/$id")({
  head: () => ({
    meta: [
      { title: "صفحة البائع — قطّعتي" },
      { name: "description", content: "صفحة البائع في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "صفحة البائع — قطّعتي" },
      { property: "og:description", content: "صفحة البائع في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="صفحة البائع" />,
});
