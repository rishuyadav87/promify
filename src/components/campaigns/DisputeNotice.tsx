import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const DISPUTE_STATUS_LABEL: Record<string, string> = {
  open: "Awaiting review",
  under_review: "Under review",
  resolved: "Resolved",
  rejected: "Rejected",
};

export function DisputeNotice({
  reason,
  status,
  createdAt,
}: {
  reason: string;
  status: string;
  createdAt: string;
}) {
  return (
    <Card className="flex flex-col gap-2 border-error/30">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">Issue reported</h2>
        <Badge variant="brick">
          {DISPUTE_STATUS_LABEL[status] ?? status}
        </Badge>
      </div>
      <p className="text-sm text-ink">{reason}</p>
      <p className="text-xs text-warmgray">
        Reported {new Date(createdAt).toLocaleString("en-IN")}. An admin will
        review this — the campaign is paused until then.
      </p>
    </Card>
  );
}
