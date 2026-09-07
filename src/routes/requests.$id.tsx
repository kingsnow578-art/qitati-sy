import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/requests/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل الطلب — قطّعتي" },
      { name: "description", content: "تفاصيل الطلب في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "تفاصيل الطلب — قطّعتي" },
      { property: "og:description", content: "تفاصيل الطلب في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="تفاصيل الطلب" />,
});
