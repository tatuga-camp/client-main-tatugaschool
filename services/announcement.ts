import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityClient } from "../sanity/lib/client";

export type AnnouncementType = "feature" | "fix" | "news" | "announcement";

export type Announcement = {
  _id: string;
  type: AnnouncementType;
  publishedAt: string;
  titleEn: string;
  titleTh: string;
  bodyEn: PortableTextBlock[];
  bodyTh: PortableTextBlock[];
  coverImage: SanityImageSource | null;
};

const announcementsQuery = `*[_type == "news" && defined(publishedAt)] | order(publishedAt desc){
  _id,
  type,
  publishedAt,
  titleEn,
  titleTh,
  bodyEn,
  bodyTh,
  coverImage
}`;

export async function GetAnnouncementsService(): Promise<Announcement[]> {
  return sanityClient.fetch<Announcement[]>(announcementsQuery);
}
