/** Public home CMS payload from GET /api/home_contents */

export type HomeSectionImage = {
  id: string;
  image_url: string;
  status: boolean;
};

export type HomeSection = {
  id: string;
  section_name: string;
  section_content: string | null;
  images: HomeSectionImage[];
};

export type HomeContentsPayload = {
  page: {
    id: string;
    page_name: string;
    created_at: string;
    updated_at: string;
  };
  sections: HomeSection[];
};

export type HomeContentsResponse = {
  success: boolean;
  data: HomeContentsPayload;
  count: number;
};

/** Base URL for API + /assets (no trailing slash). In dev, empty uses Vite proxy. */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv?.trim()) {
    return fromEnv.replace(/\/$/, "");
  }
  if (import.meta.env.DEV) {
    return "";
  }
  return "http://localhost:4000";
}

export function homeContentsApiUrl(): string {
  const base = getApiBaseUrl();
  return base ? `${base}/api/home_contents` : "/api/home_contents";
}

export function assetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\//, "");
  const base = getApiBaseUrl();
  return base ? `${base}/assets/${clean}` : `/assets/${clean}`;
}

export async function fetchHomeContents(): Promise<HomeContentsPayload> {
  const res = await fetch(homeContentsApiUrl(), { credentials: "omit" });
  if (!res.ok) {
    throw new Error(`home_contents failed: ${res.status}`);
  }
  const body = (await res.json()) as HomeContentsResponse;
  if (!body.success || !body.data) {
    throw new Error("home_contents: invalid response");
  }
  return body.data;
}

export function sectionByName(
  sections: HomeSection[],
  name: string
): HomeSection | undefined {
  return sections.find((s) => s.section_name === name);
}

export function activeImageUrls(section: HomeSection | undefined): string[] {
  if (!section?.images?.length) return [];
  return section.images
    .filter((img) => img.status)
    .map((img) => assetUrl(img.image_url));
}

export function parseExploreSectionContent(json: string | null): {
  heading: string;
  subHeading: string;
  buttonText: string;
} | null {
  if (!json?.trim()) return null;
  try {
    const o = JSON.parse(json) as Record<string, string>;
    const heading = o.Heading ?? o.heading;
    const subHeading = o["Sub Heading"] ?? o.SubHeading ?? o.subHeading;
    const buttonText = o["Button Text"] ?? o.ButtonText ?? o.buttonText;
    if (!heading && !subHeading && !buttonText) return null;
    return {
      heading: heading ?? "Explore Our Product Categories",
      subHeading:
        subHeading ??
        "Discover our comprehensive range of corporate gifts and promotional products",
      buttonText: buttonText ?? "View All Categories"
    };
  } catch {
    return null;
  }
}

export function parseNewProductsSectionContent(json: string | null): {
  heading: string;
  description: string;
} | null {
  if (!json?.trim()) return null;
  try {
    const o = JSON.parse(json) as Record<string, string>;
    const heading = o.Heading ?? o.heading;
    const description = o.Description ?? o.description;
    if (!heading && !description) return null;
    return {
      heading: heading ?? "New Products",
      description:
        description ??
        "Discover our latest collection of premium products. Fresh designs, innovative features, and exceptional quality that will exceed your expectations."
    };
  } catch {
    return null;
  }
}
