import type { VisualDetail } from "../../domain/visuals.contracts";

export type VisualDetailPreview =
  | { kind: "video"; src: string; poster?: string | undefined }
  | { kind: "link"; href: string }
  | { kind: "unavailable" };

export function getVisualDetailPreview(
  visual: VisualDetail,
  failedVideoSource: string | undefined,
): VisualDetailPreview {
  if (visual.type === "link")
    return visual.url === undefined || visual.url === null || visual.url === ""
      ? { kind: "unavailable" }
      : { kind: "link", href: visual.url };

  if (
    visual.file === undefined ||
    visual.file === null ||
    visual.file === "" ||
    failedVideoSource === visual.file
  )
    return { kind: "unavailable" };
  return {
    kind: "video",
    src: visual.file,
    ...(visual.thumbnail === undefined || visual.thumbnail === null
      ? {}
      : { poster: visual.thumbnail }),
  };
}
