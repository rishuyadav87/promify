"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { updateUsername } from "@/lib/actions/account";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={pending}
      className="self-start"
    >
      {pending ? "Saving…" : "Save username"}
    </Button>
  );
}

export function UsernameForm({
  currentUsername,
}: {
  currentUsername: string | null;
}) {
  const [state, formAction] = useFormState(updateUsername, { error: null });

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-ink">Username</h2>
        <p className="mt-1 text-sm text-warmgray">
          A short handle for your account, separate from your display name.
          Lowercase letters, numbers, and underscores only.
        </p>
      </div>
      <form action={formAction} className="flex flex-col gap-3">
        <input
          type="text"
          name="username"
          defaultValue={currentUsername ?? ""}
          placeholder="e.g. rishu_creates"
          className="rounded-md border border-ink/20 bg-surface px-3 py-2 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
        />
        {state.error && <p className="text-sm text-error">{state.error}</p>}
        <SaveButton />
      </form>
    </Card>
  );
}