import * as pageService from "./page.service";
import * as pageSectionService from "./pageSection.service";
import * as pageImageService from "./pageImage.service";
import { HttpError } from "../utils/httpError";

export type PublicHomeSection = {
  id: string;
  section_name: string;
  section_content: string | null;
  created_time: Date;
  updated_time: Date;
  images: {
    id: string;
    image_url: string;
    status: boolean;
    created_time: Date;
    updated_time: Date;
  }[];
};

export type PublicHomeContentPayload = {
  page: {
    id: string;
    page_name: string;
    created_at: Date;
    updated_at: Date;
  };
  sections: PublicHomeSection[];
};

export async function getHomeContents(): Promise<PublicHomeContentPayload> {
  const page = await pageService.getPageByName("home");
  if (!page) {
    throw new HttpError(404, 'Page "home" not found');
  }

  const pageId = Number.parseInt(page.id, 10);
  const sections = await pageSectionService.listPageSections(pageId);
  const images = await pageImageService.listPageImages();

  const imagesBySection = new Map<string, PublicHomeSection["images"]>();
  for (const img of images) {
    if (!imagesBySection.has(img.section_id)) {
      imagesBySection.set(img.section_id, []);
    }
    imagesBySection.get(img.section_id)?.push({
      id: img.id,
      image_url: img.image_url,
      status: img.status,
      created_time: img.created_time,
      updated_time: img.updated_time
    });
  }

  return {
    page: {
      id: page.id,
      page_name: page.page_name,
      created_at: page.created_at,
      updated_at: page.updated_at
    },
    sections: sections.map((s) => ({
      id: s.id,
      section_name: s.section_name,
      section_content: s.section_content,
      created_time: s.created_time,
      updated_time: s.updated_time,
      images: imagesBySection.get(s.id) ?? []
    }))
  };
}

