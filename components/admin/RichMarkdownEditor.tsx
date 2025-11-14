"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
// Removed CodeBlockLowlight - using default code block from StarterKit instead
// Syntax highlighting is handled on the blog post display page
import { useState, useEffect } from "react";
import TurndownService from "turndown";
import { marked } from "marked";

interface RichMarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export function RichMarkdownEditor({ content, onChange, placeholder = "Write your blog post content..." }: RichMarkdownEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [turndownService] = useState(() => {
    const service = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
    });
    return service;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatch
    extensions: [
      StarterKit, // Includes code block support
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline",
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      // Convert HTML to markdown for storage
      const html = editor.getHTML();
      const markdown = turndownService.turndown(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3 prose-headings:font-bold prose-p:my-4 prose-p:leading-relaxed prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:overflow-x-auto prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-4 prose-blockquote:italic prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline prose-img:rounded-lg prose-img:my-4",
      },
    },
  });

  // Update editor content when prop changes (convert markdown to HTML for Tiptap)
  useEffect(() => {
    if (editor && content) {
      const currentHtml = editor.getHTML();
      // Always treat content as markdown if it contains markdown syntax, otherwise check if it's HTML
      const isMarkdown = /^[#*\-`\[\]()]/.test(content.trim()) || 
                        content.includes('\n#') || 
                        content.includes('\n*') || 
                        content.includes('\n-') ||
                        content.includes('```') ||
                        content.includes('**') ||
                        content.includes('__');
      
      if (isMarkdown) {
        // Convert markdown to HTML
        try {
          const html = marked.parse(content, {
            breaks: true,
            gfm: true,
          }) as string;
          // Only update if content actually changed
          if (html !== currentHtml && html.trim() !== currentHtml.trim()) {
            editor.commands.setContent(html);
          }
        } catch (error) {
          console.error("Error parsing markdown:", error);
          // Fallback: try to set as HTML
          if (content !== currentHtml) {
            editor.commands.setContent(content);
          }
        }
      } else {
        // Assume it's HTML or plain text
        if (content !== currentHtml && content.trim() !== currentHtml.trim()) {
          editor.commands.setContent(content);
        }
      }
    } else if (editor && !content) {
      // Clear editor if content is empty
      const currentHtml = editor.getHTML();
      if (currentHtml !== '<p></p>') {
        editor.commands.setContent('');
      }
    }
  }, [content, editor]);

  const handleImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        
        if (editor) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch (error: any) {
        alert(error.message || "Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  if (!mounted || !editor) {
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900 min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-950">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-800 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("bold") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("italic") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Italic"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("underline") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={!editor.can().chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("code") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Inline Code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-800 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("heading", { level: 1 }) ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("heading", { level: 2 }) ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("heading", { level: 3 }) ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-800 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("bulletList") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13m-13 6h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("orderedList") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </button>
        </div>

        {/* Code Block */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-800 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("codeBlock") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Code Block"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </button>
        </div>

        {/* Blockquote */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-800 pr-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("blockquote") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Quote"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </div>

        {/* Link */}
        <div className="flex gap-1 border-r border-gray-200 dark:border-gray-800 pr-2">
          <button
            type="button"
            onClick={() => {
              const url = window.prompt("Enter URL:");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 ${editor.isActive("link") ? "bg-blue-100 dark:bg-blue-900" : ""}`}
            title="Add Link"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleImageUpload}
            disabled={isUploading}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50"
            title="Upload Image"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-[400px] max-h-[600px] overflow-y-auto">
        <EditorContent editor={editor} className="w-full" />
      </div>
    </div>
  );
}

