import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "الرسائل — قطّعتي" },
      { name: "description", content: "الرسائل في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "الرسائل — قطّعتي" },
      { property: "og:description", content: "الرسائل في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="الرسائل" />,
});
