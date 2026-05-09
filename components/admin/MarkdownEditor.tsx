"use client";

import { useState, useRef, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
import { uploadImage } from "@/app/admin/actions";

type Tab = "write" | "preview";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

function insertAround(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.slice(start, end) || placeholder;
  const newValue =
    textarea.value.slice(0, start) +
    before +
    selected +
    after +
    textarea.value.slice(end);
  return { newValue, cursor: start + before.length + selected.length + after.length };
}

function insertAtCursor(textarea: HTMLTextAreaElement, text: string) {
  const start = textarea.selectionStart;
  const newValue =
    textarea.value.slice(0, start) + text + textarea.value.slice(start);
  return { newValue, cursor: start + text.length };
}

export default function MarkdownEditor({ value, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("write");
  const [isUploading, startUploadTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function applyFormat(
    before: string,
    after: string,
    placeholder: string,
  ) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { newValue, cursor } = insertAround(
      textarea,
      before,
      after,
      placeholder,
    );
    onChange(newValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    startUploadTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);

      if ("error" in result) {
        alert("이미지 업로드 실패: " + result.error!);
        return;
      }

      const textarea = textareaRef.current;
      if (!textarea || !result.url) return;
      const imgMd = `![image](${result.url})`;
      const { newValue, cursor } = insertAtCursor(textarea, imgMd);
      onChange(newValue);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      });
    });
  }

  const tabClass = (t: Tab) =>
    `px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
      tab === t
        ? "text-blue-600 border-blue-600 dark:text-blue-400 dark:border-blue-400"
        : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
    }`;

  const toolbarBtn =
    "px-2 py-1 text-xs font-mono text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors";

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2">
        <div className="flex">
          <button type="button" className={tabClass("write")} onClick={() => setTab("write")}>
            Write
          </button>
          <button type="button" className={tabClass("preview")} onClick={() => setTab("preview")}>
            Preview
          </button>
        </div>

        {tab === "write" && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className={toolbarBtn}
              title="Bold"
              onClick={() => applyFormat("**", "**", "bold text")}
            >
              B
            </button>
            <button
              type="button"
              className={`${toolbarBtn} italic`}
              title="Italic"
              onClick={() => applyFormat("*", "*", "italic text")}
            >
              I
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Inline code"
              onClick={() => applyFormat("`", "`", "code")}
            >
              {"<>"}
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Heading"
              onClick={() => applyFormat("## ", "", "Heading")}
            >
              H
            </button>
            <button
              type="button"
              className={toolbarBtn}
              title="Code block"
              onClick={() => applyFormat("```\n", "\n```", "code block")}
            >
              {"{ }"}
            </button>
            <button
              type="button"
              className={`${toolbarBtn} ${isUploading ? "opacity-50" : ""}`}
              title="Upload image"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? "..." : "IMG"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        )}
      </div>

      {tab === "write" ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-[500px] p-4 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none resize-y leading-relaxed"
          placeholder="# 마크다운으로 글을 작성하세요..."
          spellCheck={false}
        />
      ) : (
        <div className="h-[500px] p-4 overflow-y-auto bg-white dark:bg-gray-900">
          {value ? (
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkUnwrapImages]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-600 italic text-sm">
              미리볼 내용이 없습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
