export function statusBadgeVariant(
  status: string,
): "brick" | "teal" | "neutral" {
  if (status === "disputed" || status === "refunded" || status === "declined")
    return "brick";
  if (status === "completed" || status === "accepted" || status === "live")
    return "teal";
  return "neutral";
}
