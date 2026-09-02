"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

// Same base classes as the plain <input> fields on the auth pages (see
// login/signup/reset-password), plus right padding so typed text never
// runs under the toggle button.
const inputClasses =
  "w-full rounded-md border border-ink/20 bg-surface px-3 py-2 pr-10 text-sm text-ink placeholder:text-warmgray focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";

// Drop-in replacement for `<input type="password" ... />` -- accepts the
// same props (id, name, value, onChange, autoComplete, required,
// minLength, etc.) so every existing password field can switch to this
// with a one-line change and no other markup adjustments.
export function PasswordInput({
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${inputClasses} ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        // Keeps the toggle out of the tab order between the password
        // field and whatever comes next (e.g. the submit button) --
        // it's a convenience click target, not a field to tab through.
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-warmgray hover:text-ink"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}