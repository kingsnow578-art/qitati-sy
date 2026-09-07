import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "إضافة منتج — قطّعتي" },
      { name: "description", content: "إضافة منتج في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "إضافة منتج — قطّعتي" },
      { property: "og:description", content: "إضافة منتج في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="إضافة منتج" />,
});
