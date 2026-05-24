"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createArticle, updateArticle } from "@/server/actions/articles";
import { slugify } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
  article?: {
    id: number;
    title: string;
    titleAr: string;
    slug: string;
    content: object;
    categoryId: number;
    coverImage: string | null;
    isFeatured: boolean;
    isDraft: boolean;
  };
}

const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "iframe",
      mergeAttributes(HTMLAttributes, {
        frameborder: "0",
        allowfullscreen: "true",
        class: "w-full aspect-video rounded-lg my-4 border-0",
      }),
    ];
  },
  addNodeView() {
    return ({ node }) => {
      const src = node.attrs.src as string;
      const isTwitter = src?.includes("platform.twitter.com");
      const wrap = document.createElement("div");
      wrap.className = isTwitter ? "flex justify-center my-4" : "my-4";
      const iframe = document.createElement("iframe");
      iframe.src = src;
      iframe.style.border = "none";
      iframe.allowFullscreen = true;
      if (isTwitter) {
        iframe.className = "w-full rounded-lg";
        iframe.style.maxWidth = "500px";
        iframe.style.height = "500px";
      } else {
        iframe.className = "w-full aspect-video rounded-lg";
      }
      wrap.appendChild(iframe);
      return { dom: wrap };
    };
  },
});

const AutoDirParagraph = Paragraph.extend({
  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes, { dir: "auto" }), 0];
  },
});

const AutoDirHeading = Heading.extend({
  renderHTML({ HTMLAttributes, node }) {
    const level = node.attrs.level as number;
    return [`h${level}`, mergeAttributes(HTMLAttributes, { dir: "auto" }), 0];
  },
});

const IMAGE_EXTENSIONS = /\.(jpe?g|png|gif|webp|svg|avif)(\?.*)?$/i;

function toEmbedUrl(raw: string): string {
  const yt = raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const tw = raw.match(/(?:twitter\.com|x\.com)\/(?:i\/status|[^/]+\/status)\/(\d+)/);
  if (tw) return `https://platform.twitter.com/embed/Tweet.html?id=${tw[1]}`;
  return raw;
}

// ── Icons ────────────────────────────────────────────────────────────────────

const Icon = ({ d, size = 16 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  bold:        "M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z",
  italic:      "M19 4h-9M14 20H5M15 4 9 20",
  underline:   "M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16",
  h2:          "M4 12h8M4 6v12M16 6v12M21 18v-3a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v3M16 13h6",
  h3:          "M4 12h8M4 6v12M18 7h2a2 2 0 0 1 0 5h-2M18 12h2a2 2 0 0 1 0 5h-2",
  bulletList:  "M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01",
  orderedList: "M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10H6M6 18H4c0-1 2-2 2-3s-1-1.5-2-1",
  blockquote:  "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",
  link:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  image:       "M21 15l-5-5L5 21M3 3h18v18H3zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  embed:       "M8 6L3 12L8 18M16 6L21 12L16 18M14 4L10 20",
  divider:     "M5 12h14",
};

const ToolbarButton = ({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    className={`p-2 sm:p-1.5 rounded transition-colors touch-manipulation ${
      active
        ? "bg-ink/15 text-ink"
        : "text-ink-soft hover:text-ink hover:bg-ink/8"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-line mx-0.5" />;

// ─────────────────────────────────────────────────────────────────────────────

export default function ArticleEditor({ categories, article }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(article?.title ?? "");
  const [titleAr, setTitleAr] = useState(article?.titleAr ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? categories[0]?.id ?? 0);
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [isFeatured, setIsFeatured] = useState(article?.isFeatured ?? false);
  const [slug, setSlug] = useState(article?.slug ?? "");
  const slugEditedRef = useRef(!!article);
  const [pendingAction, setPendingAction] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [, setTick] = useState(0);
  const [coverUploading, setCoverUploading] = useState(false);
  const [editorUploading, setEditorUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  async function uploadToCloud(file: File, folder: "covers" | "content"): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const { url } = await res.json();
    return url;
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false, paragraph: false, heading: false }),
      AutoDirParagraph,
      AutoDirHeading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Iframe,
    ],
    content: article?.content ?? "",
    onUpdate: () => { setIsDirty(true); setTick((n: number) => n + 1); },
    onSelectionUpdate: () => setTick((n: number) => n + 1),
    onTransaction: () => setTick((n: number) => n + 1),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[320px] focus:outline-none px-6 py-4 text-ink [&_a]:text-blue-500 [&_a]:underline",
        dir: "auto",
      },
    },
  });

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Double-tap = select word, triple-tap = select paragraph
  useEffect(() => {
    if (!editor?.view) return;
    const dom = editor.view.dom;
    let taps = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastX = 0;
    let lastY = 0;

    const onTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      const sameArea = Math.abs(x - lastX) < 40 && Math.abs(y - lastY) < 40;

      if (!sameArea) { taps = 0; lastX = x; lastY = y; }
      taps++;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 400);

      if (taps === 2) {
        e.preventDefault();
        requestAnimationFrame(() => {
          const { from } = editor.state.selection;
          const $pos = editor.state.doc.resolve(from);
          const text = $pos.parent.textContent;
          const off = $pos.parentOffset;
          let s = off;
          let end = off;
          while (s > 0 && /\S/.test(text[s - 1])) s--;
          while (end < text.length && /\S/.test(text[end])) end++;
          if (s < end) {
            editor.commands.setTextSelection({ from: $pos.start() + s, to: $pos.start() + end });
          }
        });
      } else if (taps === 3) {
        e.preventDefault();
        requestAnimationFrame(() => {
          const { from } = editor.state.selection;
          const $pos = editor.state.doc.resolve(from);
          editor.commands.setTextSelection({ from: $pos.start(), to: $pos.end() });
        });
        taps = 0;
      }
    };

    dom.addEventListener("touchend", onTouchEnd, { passive: false });
    return () => dom.removeEventListener("touchend", onTouchEnd);
  }, [editor]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      const url = await uploadToCloud(file, "covers");
      setCoverImage(url);
      setIsDirty(true);
    } catch {
      setError("Cover image upload failed.");
    } finally {
      setCoverUploading(false);
      e.target.value = "";
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    setEditorUploading(true);
    try {
      const url = await uploadToCloud(file, "content");
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      setError("Image upload failed.");
    } finally {
      setEditorUploading(false);
      e.target.value = "";
    }
  }

  function handleEmbed() {
    const raw = prompt("Paste a YouTube, PDF, or any embeddable URL:");
    if (!raw) return;
    const trimmed = raw.trim();
    if (IMAGE_EXTENSIONS.test(trimmed)) {
      editor?.chain().focus().setImage({ src: trimmed }).run();
    } else {
      const src = toEmbedUrl(trimmed);
      editor?.chain().focus().insertContent({ type: "iframe", attrs: { src } }).run();
    }
  }

  function handleLink() {
    const url = prompt("URL:");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().unsetLink().run();
    } else {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  const sanitizeSlug = useCallback((val: string) =>
    val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\u0600-\u06FF-]/g, "").replace(/-+/g, "-"), []);

  function save(asDraft: boolean) {
    if (!editor) return;
    if (!title.trim()) { setError("Title is required."); return; }
    const finalSlug = slug.replace(/^-+|-+$/g, "");
    if (!finalSlug) { setError("Slug is required."); return; }
    setError("");
    const content = JSON.parse(JSON.stringify(editor.getJSON()));
    setPendingAction(asDraft ? "draft" : "publish");

    startTransition(async () => {
      try {
        if (article) {
          await updateArticle(article.id, {
            title, titleAr, slug: finalSlug, content, categoryId: Number(categoryId),
            coverImage: coverImage || undefined, isFeatured,
            isDraft: asDraft,
            ...(article.isDraft && !asDraft && { publishedAt: new Date() }),
          });
        } else {
          await createArticle({ title, titleAr, slug: finalSlug, content, categoryId: Number(categoryId), coverImage: coverImage || undefined, isFeatured, isDraft: asDraft });
        }
        setIsDirty(false);
        router.push("/admin/articles");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    save(false);
  }

  const previewCategory = categories.find((c) => c.id === Number(categoryId));

  return (
    <div className="flex gap-8 items-start max-w-6xl w-full min-w-0">
    <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-6 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Title (English)</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => {
              const val = e.target.value;
              setTitle(val);
              setIsDirty(true);
              if (!slugEditedRef.current) setSlug(slugify(val));
            }}
            placeholder="Article title in English…"
            className="w-full px-4 py-2.5 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Title (Arabic)</label>
          <input
            type="text"
            value={titleAr}
            onChange={(e) => { setTitleAr(e.target.value); setIsDirty(true); }}
            placeholder="عنوان المقالة بالعربية…"
            dir="rtl"
            className="w-full px-4 py-2.5 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent text-right"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Category</label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full px-4 py-2.5 pr-9 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-ink">Cover image</label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Featured</span>
              <button
                type="button"
                role="switch"
                aria-checked={isFeatured}
                onClick={() => { setIsFeatured((v) => !v); setIsDirty(true); }}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isFeatured ? "bg-accent" : "bg-ink/20"
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${isFeatured ? "translate-x-4.5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={coverImage}
              onChange={(e) => { setCoverImage(e.target.value); setIsDirty(true); }}
              placeholder="https://… or upload →"
              className="flex-1 min-w-0 w-0 px-4 py-2.5 rounded-lg border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="shrink-0 px-3 py-2.5 rounded-lg border border-line bg-surface text-ink-soft text-sm hover:text-ink hover:border-accent transition-colors disabled:opacity-50"
            >
              {coverUploading ? "…" : <Icon d={icons.image} />}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Content</label>
        <div className="rounded-lg border border-line bg-canvas">
          {/* Toolbar */}
          <div className="sticky top-14 lg:top-0 z-20 flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-line bg-header rounded-t-lg">
            <ToolbarButton title="Bold" onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive("bold")}>
              <Icon d={icons.bold} />
            </ToolbarButton>
            <ToolbarButton title="Italic" onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive("italic")}>
              <Icon d={icons.italic} />
            </ToolbarButton>
            <ToolbarButton title="Underline" onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive("underline")}>
              <Icon d={icons.underline} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton title="Heading 2" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive("heading", { level: 2 })}>
              <span className="text-xs font-bold">H2</span>
            </ToolbarButton>
            <ToolbarButton title="Heading 3" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive("heading", { level: 3 })}>
              <span className="text-xs font-bold">H3</span>
            </ToolbarButton>

            <Divider />

            <ToolbarButton title="Bullet list" onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive("bulletList")}>
              <Icon d={icons.bulletList} />
            </ToolbarButton>
            <ToolbarButton title="Ordered list" onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive("orderedList")}>
              <Icon d={icons.orderedList} />
            </ToolbarButton>
            <ToolbarButton title="Blockquote" onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive("blockquote")}>
              <Icon d={icons.blockquote} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton title="Link" onClick={handleLink} active={editor?.isActive("link")}>
              <Icon d={icons.link} />
            </ToolbarButton>
            <ToolbarButton title="Insert image" onClick={() => !editorUploading && fileInputRef.current?.click()}>
              {editorUploading ? <span className="text-xs">…</span> : <Icon d={icons.image} />}
            </ToolbarButton>
            <ToolbarButton title="Embed (YouTube, PDF, URL…)" onClick={handleEmbed}>
              <Icon d={icons.embed} />
            </ToolbarButton>
            <ToolbarButton title="Divider" onClick={() => editor?.chain().focus().setHorizontalRule().run()}>
              <Icon d={icons.divider} />
            </ToolbarButton>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

          <EditorContent editor={editor} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">
          Slug
          <span className="ml-2 text-xs font-normal text-ink-muted truncate max-w-full">URL: /{"{category}"}/<span className="text-accent">{slug || "…"}</span></span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            slugEditedRef.current = true;
            setSlug(sanitizeSlug(e.target.value));
            setIsDirty(true);
          }}
          placeholder="article-slug"
          className="w-full px-4 py-2.5 rounded-lg border border-line bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {error && <p className="text-sm text-accent font-medium">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
        >
          {pendingAction === "publish"
            ? "Saving…"
            : article
              ? article.isDraft ? "Publish Now" : "Save Changes"
              : "Publish Article"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => save(true)}
          className="px-5 py-2 text-sm font-semibold rounded-lg border border-line text-ink-soft hover:text-ink hover:border-accent transition-colors disabled:opacity-50"
        >
          {pendingAction === "draft" ? "Saving…" : "Save as Draft"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (isDirty && !confirm("You have unsaved changes. Leave anyway?")) return;
            router.back();
          }}
          className="px-5 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>

    <div className="w-64 xl:w-72 shrink-0 sticky top-6 hidden lg:block">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Preview</p>
      <div className="rounded-lg border border-line overflow-hidden bg-card">
        {coverImage ? (
          <div className="relative aspect-video overflow-hidden">
            <img src={coverImage} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="aspect-video bg-line flex items-center justify-center">
            <span className="text-ink-muted text-xs">No image</span>
          </div>
        )}
        <div className="p-3 space-y-1.5">
          {previewCategory && (
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-accent text-white px-1.5 py-0.5 rounded">
              {previewCategory.name}
            </span>
          )}
          <p className="font-semibold text-ink text-sm leading-snug" dir="rtl">
            {titleAr || <span className="text-ink-muted italic font-normal">Arabic title…</span>}
          </p>
          <p className="text-xs text-ink-muted">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </div>
    </div>
    </div>
  );
}
