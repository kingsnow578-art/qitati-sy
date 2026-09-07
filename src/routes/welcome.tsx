import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "أهلاً بك — قطّعتي" },
      { name: "description", content: "أهلاً بك في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "أهلاً بك — قطّعتي" },
      { property: "og:description", content: "أهلاً بك في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="أهلاً بك" />,
});
