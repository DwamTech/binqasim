import type { AdminSummary } from "../auth/domain/auth.contracts";
import type { Article } from "./articles.contracts";

function hasPermission(actor: AdminSummary): boolean {
  return (
    actor.role === "admin" ||
    actor.dashboardPermissions.includes("articles.manage")
  );
}

export function canCreateArticle(actor: AdminSummary): boolean {
  return (
    hasPermission(actor) && (actor.role === "admin" || actor.role === "author")
  );
}

export function canEditArticle(
  actor: AdminSummary,
  article: Pick<Article, "user_id">,
): boolean {
  if (!hasPermission(actor)) return false;
  if (actor.role === "admin") return true;
  return actor.role === "author" && article.user_id === actor.id;
}

export const canDeleteArticle = canEditArticle;
export const canDeleteArticleMedia = canEditArticle;

export function canToggleArticleStatus(actor: AdminSummary): boolean {
  return actor.role === "admin";
}
