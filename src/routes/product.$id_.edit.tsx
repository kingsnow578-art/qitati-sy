import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/product/$id_/edit")({
  head: () => ({
    meta: [
      { title: "تعديل المنتج — قطّعتي" },
      { name: "description", content: "تعديل المنتج في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:title", content: "تعديل المنتج — قطّعتي" },
      { property: "og:description", content: "تعديل المنتج في تطبيق قطّعتي، سوق قطع الكمبيوتر والإلكترونيات في سوريا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <ComingSoon title="تعديل المنتج" />,
});
