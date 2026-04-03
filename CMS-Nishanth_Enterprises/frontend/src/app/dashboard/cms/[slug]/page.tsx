import { notFound } from "next/navigation";
import CmsPageEditor from "@/components/CmsPageEditor";
import CmsProductsCatalog from "@/components/CmsProductsCatalog";

const ALLOWED_SLUGS = new Set(["home", "products", "about_us", "contact_us", "header_footer"]);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CmsPageRoute({ params }: PageProps) {
  const { slug } = await params;
  if (!ALLOWED_SLUGS.has(slug)) {
    notFound();
  }
  if (slug === "products") {
    return <CmsProductsCatalog />;
  }
  return <CmsPageEditor pageSlug={slug} />;
}
