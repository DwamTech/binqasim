import { resolveMediaUrl } from "@/core/media/resolve-media-url";
import type {
  HadithCard,
  HadithCardProject,
  HadithCardProjectPage,
} from "../domain/hadith-cards";

/** Makes uploaded image paths usable by the dashboard origin without exposing
 * storage implementation details to the browser. External URLs are retained. */
export function presentHadithCard(card: HadithCard): HadithCard {
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (card.image_source_type !== "file" || !backendApiUrl) {
    return card;
  }

  return {
    ...card,
    image_url: resolveMediaUrl(card.image_url, backendApiUrl) ?? card.image_url,
  };
}

export function presentHadithCardProject(
  project: HadithCardProject,
): HadithCardProject {
  const backendApiUrl = process.env.BACKEND_API_URL;
  const coverImageUrl =
    project.cover_image_source_type === "file" && backendApiUrl
      ? (resolveMediaUrl(project.cover_image_url, backendApiUrl) ??
        project.cover_image_url)
      : project.cover_image_url;
  return {
    ...project,
    cover_image_url: coverImageUrl,
    cards: project.cards.map(presentHadithCard),
  };
}

export function presentHadithCardProjectPage(
  page: HadithCardProjectPage,
): HadithCardProjectPage {
  return {
    ...page,
    data: page.data.map(presentHadithCardProject),
  };
}
