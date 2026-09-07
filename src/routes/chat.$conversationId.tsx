import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/chat/$conversationId")({
  head: () => ({
    meta: [
      { title: "المحادثة — قطّعتي" },
      { name: "description", content: "المحادثة في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "المحادثة — قطّعتي" },
      { property: "og:description", content: "المحادثة في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="المحادثة" />,
});
