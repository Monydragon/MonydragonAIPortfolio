"use client";

import { LiveEditableText } from "./LiveEditableText";

interface LiveEditableFieldProps {
  contentKey: string; // MongoDB key for this content
  field: string; // Field path within content object (e.g., "title", "subtitle", "paragraph1")
  defaultValue: string;
  className?: string;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  onUpdate?: (newValue: string) => void;
  debounceMs?: number;
}

/**
 * Convenience wrapper for LiveEditableText that automatically handles field updates
 * within a content object stored in MongoDB.
 */
export function LiveEditableField({
  contentKey,
  field,
  defaultValue,
  className,
  as,
  onUpdate,
  debounceMs,
}: LiveEditableFieldProps) {
  return (
    <LiveEditableText
      contentKey={contentKey}
      field={field}
      defaultValue={defaultValue}
      className={className}
      as={as}
      onUpdate={onUpdate}
      debounceMs={debounceMs}
    />
  );
}

