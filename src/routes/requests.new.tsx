import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/requests/new")({
  head: () => ({
    meta: [
      { title: "طلب قطعة — قطّعتي" },
      { name: "description", content: "طلب قطعة في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "طلب قطعة — قطّعتي" },
      { property: "og:description", content: "طلب قطعة في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="طلب قطعة" />,
});
