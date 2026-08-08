"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TerminalInputProps {
  onSubmit: (message: string, files?: FileList | null) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function TerminalInput({
  onSubmit,
  isLoading = false,
  placeholder = "Describe the incident or ask a question...",
}: TerminalInputProps) {
  const [value, setValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    if (!value.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;

    // Create a DataTransfer to build a FileList
    const dt = new DataTransfer();
    attachedFiles.forEach((f) => dt.items.add(f));

    onSubmit(value, dt.files.length > 0 ? dt.files : null);
    setValue("");
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, attachedFiles, isLoading, onSubmit]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) =>
        f.type.startsWith("image/")
      );
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border transition-all duration-300",
        "bg-zinc-950 border-zinc-800",
        isDragging
          ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
          : "hover:border-zinc-700 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-emerald-500/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-emerald-400">
            <svg
              className="w-8 h-8 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-mono font-medium">
              Drop screenshot here
            </span>
          </div>
        </div>
      )}

      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <div className="flex gap-2 px-3 pt-3 flex-wrap">
          {attachedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400"
            >
              <svg
                className="w-3 h-3 text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                />
              </svg>
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="ml-1 text-zinc-600 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        {/* Prompt prefix */}
        <span className="text-emerald-500 font-mono text-sm font-bold shrink-0 pb-[5px] select-none">
          $&gt;
        </span>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent text-zinc-100 text-sm",
            "font-mono placeholder:text-zinc-600",
            "focus:outline-none disabled:opacity-50",
            "leading-relaxed"
          )}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0 pb-[2px]">
          {/* File attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 transition-all"
            title="Attach screenshot"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || (!value.trim() && attachedFiles.length === 0)}
            className={cn(
              "p-1.5 rounded transition-all",
              value.trim() || attachedFiles.length > 0
                ? "text-emerald-400 hover:bg-emerald-500/10"
                : "text-zinc-600 cursor-not-allowed"
            )}
            title="Send message"
          >
            {isLoading ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Keyboard hint */}
      <div className="flex items-center justify-between px-3 pb-2">
        <span className="text-[10px] font-mono text-zinc-700">
          Enter to send · Shift+Enter for newline · Drop Grafana screenshots
        </span>
      </div>
    </div>
  );
}
