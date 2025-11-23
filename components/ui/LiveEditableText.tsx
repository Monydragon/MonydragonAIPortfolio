"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";

interface LiveEditableTextProps {
  contentKey: string; // MongoDB key for this content
  field?: string; // Optional field path within content object (e.g., "title", "paragraph1")
  defaultValue: string;
  className?: string;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  onUpdate?: (newValue: string) => void;
  debounceMs?: number; // Debounce delay in milliseconds (default: 1000)
}

export function LiveEditableText({
  contentKey,
  field,
  defaultValue,
  className = "",
  as: Component = "p",
  onUpdate,
  debounceMs = 1000,
}: LiveEditableTextProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [value, setValue] = useState(defaultValue);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLElement | null>(null);

  // Update value when defaultValue changes (from server)
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  // Save function
  const saveContent = useCallback(
    async (newValue: string) => {
      if (!isAdmin) return;

      setIsSaving(true);
      setSaveStatus("saving");

      try {
        // Fetch current content
        const currentResponse = await fetch(`/api/content/${contentKey}`);
        let currentContent = {};
        
        if (currentResponse.ok) {
          const current = await currentResponse.json();
          currentContent = current.content || {};
        }

        // Update the specific field or replace entire content
        let updatedContent;
        if (field) {
          // If field is specified, update nested field (support dot notation)
          updatedContent = { ...currentContent };
          const fieldParts = field.split(".");
          let target: any = updatedContent;
          
          for (let i = 0; i < fieldParts.length - 1; i++) {
            if (!target[fieldParts[i]]) {
              target[fieldParts[i]] = {};
            }
            target = target[fieldParts[i]];
          }
          
          target[fieldParts[fieldParts.length - 1]] = newValue;
        } else {
          // If no field specified, replace entire content with string
          updatedContent = newValue;
        }

        // Save to API
        const response = await fetch(`/api/content/${contentKey}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: updatedContent,
          }),
        });

        if (!response.ok) {
          // Try to get error message from response
          let errorMessage = "Failed to save content";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // If response isn't JSON, use status text
            errorMessage = `${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        setSaveStatus("saved");
        onUpdate?.(newValue);

        // Clear saved status after 2 seconds
        setTimeout(() => {
          setSaveStatus("idle");
        }, 2000);
      } catch (error: any) {
        console.error("Error saving content:", error);
        const errorMessage = error?.message || "Failed to save content";
        setSaveStatus("error");
        
        // Log more details for debugging
        console.error("Save error details:", {
          contentKey,
          field,
          error: errorMessage,
        });
        
        setTimeout(() => {
          setSaveStatus("idle");
        }, 3000);
      } finally {
        setIsSaving(false);
      }
    },
    [contentKey, field, isAdmin, onUpdate]
  );

  // Handle input change with debouncing
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLElement>) => {
      const newValue = e.currentTarget.textContent || "";
      setValue(newValue);

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for debounced save
      debounceTimerRef.current = setTimeout(() => {
        saveContent(newValue);
      }, debounceMs);
    },
    [saveContent, debounceMs]
  );

  // Handle blur (save immediately)
  const handleBlur = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    saveContent(value);
    setIsEditing(false);
  }, [value, saveContent]);

  // Handle keydown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && Component !== "p") {
        e.preventDefault();
        handleBlur();
      } else if (e.key === "Escape") {
        setValue(defaultValue); // Reset to original value
        setIsEditing(false);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      }
    },
    [defaultValue, handleBlur, Component]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      
      // Select all text if it's a single line input
      if (Component !== "p" && Component !== "div") {
        const range = document.createRange();
        range.selectNodeContents(inputRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // For multi-line, just place cursor at end
        const range = document.createRange();
        range.selectNodeContents(inputRef.current);
        range.collapse(false);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isEditing, Component]);

  // Render non-editable version for non-admins
  if (!isAdmin) {
    return <Component className={className}>{value}</Component>;
  }

  // Render editable version for admins
  // Use span wrapper with inline-block to avoid hydration errors when used inside <p> tags
  return (
    <span className="relative group inline-block">
      {isEditing ? (
        <Component
          ref={(el) => {
            inputRef.current = el;
            if (el && el.textContent !== value) {
              el.textContent = value;
            }
          }}
          contentEditable
          suppressContentEditableWarning
          className={`${className} outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded px-1 py-0.5 ${
            isSaving ? "opacity-75" : ""
          }`}
          onInput={handleInput}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={{ minHeight: "1.5em" }}
        >
          {value}
        </Component>
      ) : (
        <Component
          className={`${className} cursor-text hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded px-1 py-0.5 transition-colors ${
            isSaving ? "opacity-75" : ""
          }`}
          onClick={() => setIsEditing(true)}
          title="Click to edit"
        >
          {value}
        </Component>
      )}
      
      {/* Status indicator */}
      {isAdmin && saveStatus !== "idle" && (
        <span
          className={`absolute -right-6 top-0 text-xs ${
            saveStatus === "saving"
              ? "text-yellow-500 animate-pulse"
              : saveStatus === "saved"
              ? "text-green-500"
              : "text-red-500"
          }`}
          title={
            saveStatus === "saving"
              ? "Saving..."
              : saveStatus === "saved"
              ? "Saved"
              : "Error saving"
          }
        >
          {saveStatus === "saving" ? "⏳" : saveStatus === "saved" ? "✓" : "✗"}
        </span>
      )}
    </span>
  );
}

