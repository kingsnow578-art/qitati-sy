import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/my-store")({
  head: () => ({
    meta: [
      { title: "متجري — قطّعتي" },
      { name: "description", content: "متجري في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "متجري — قطّعتي" },
      { property: "og:description", content: "متجري في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="متجري" />,
});
