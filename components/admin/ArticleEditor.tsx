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
import { createArticle, deleteArticle, updateArticle } from "@/server/actions/articles";
import { uploadImage } from "@/lib/upload-image";
import { slugify } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface AuthorOption {
  id: number;
  name: string;
  isVerified: boolean;
}


interface Props {
  categories: Category[];
  authors: AuthorOption[];
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
    authorId: number | null;
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
    aria-label={title}
    aria-pressed={active}
    className={`grid size-10 shrink-0 place-items-center rounded-full transition-colors touch-manipulation lg:size-8 ${
      active
        ? "bg-ink/15 text-ink"
        : "text-ink-soft hover:text-ink hover:bg-ink/8"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-line" />;

// ─────────────────────────────────────────────────────────────────────────────

export default function ArticleEditor({ categories, authors, article }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(article?.title ?? "");
  const [titleAr, setTitleAr] = useState(article?.titleAr ?? "");
  const [categoryId, setCategoryId] = useState(article?.categoryId ?? categories[0]?.id ?? 0);
  // 0 = no byline ("Tollab Nation")
  const [authorId, setAuthorId] = useState<number>(article?.authorId ?? 0);
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
          "prose prose-sm dark:prose-invert max-w-none min-h-[45vh] lg:min-h-[320px] focus:outline-none px-4 py-4 sm:px-6 text-ink [&_a]:text-accent-ink [&_a]:underline",
        dir: "auto",
      },
    },
  });

  // Unsaved work is protected from tab closes *and* from in-app links (menu, tab bar).
  useEffect(() => {
    if (!isDirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a || a.getAttribute("target") === "_blank") return;
      if (!confirm("You have unsaved changes. Leave anyway?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [isDirty]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    try {
      setError("");
      const url = await uploadImage(file, "covers");
      setCoverImage(url);
      setIsDirty(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover image upload failed.");
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
      setError("");
      const url = await uploadImage(file, "content");
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
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
            authorId: authorId || null,
            isDraft: asDraft,
            ...(article.isDraft && !asDraft && { publishedAt: new Date() }),
          });
        } else {
          await createArticle({ title, titleAr, slug: finalSlug, content, categoryId: Number(categoryId), coverImage: coverImage || undefined, isFeatured, authorId: authorId || null, isDraft: asDraft });
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
  const selectedAuthor = authors.find((a) => a.id === authorId);

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
            className="w-full px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
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
            className="w-full px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent text-right"
          />
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-ink mb-2">Written by</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup">
          {[{ id: 0, name: "Tollab Nation", isVerified: false }, ...authors].map((a) => {
            const selected = authorId === a.id;
            return (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => { setAuthorId(a.id); setIsDirty(true); }}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  selected ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface text-ink-soft hover:text-ink"
                }`}
              >
                {a.name}
                {a.isVerified && (
                  <svg width="13" height="13" viewBox="0 0 24 24" aria-label="Verified">
                    <circle cx="12" cy="12" r="11" fill="#ED1C24" />
                    <path d="M7.5 12.3l3 3 6-6.3" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {authors.length === 0 && (
          <p className="mt-2 text-xs text-ink-muted">No authors yet. Add them under Authors in the menu.</p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Category</label>
          <div className="relative">
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(Number(e.target.value)); setIsDirty(true); }}
              className="w-full px-4 py-2.5 pr-9 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
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
            <button
              type="button"
              role="switch"
              aria-checked={isFeatured}
              onClick={() => { setIsFeatured((v) => !v); setIsDirty(true); }}
              className="-my-2 flex items-center gap-2 py-2 text-xs font-medium text-ink-muted"
            >
              Featured
              <span className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${isFeatured ? "bg-accent" : "bg-ink/20"}`}>
                <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform duration-200 ${isFeatured ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </span>
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={coverImage}
              onChange={(e) => { setCoverImage(e.target.value); setIsDirty(true); }}
              placeholder="Paste image link…"
              className="flex-1 min-w-0 w-0 px-4 py-2.5 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-ink disabled:opacity-50"
            >
              <Icon d={icons.image} />
              {coverUploading ? "Uploading…" : "Upload"}
            </button>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          </div>
          {coverImage && (
            <div className="relative mt-2 aspect-video overflow-hidden border border-line bg-surface lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="Cover preview" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => { setCoverImage(""); setIsDirty(true); }}
                aria-label="Remove cover image"
                className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-black/70 text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">Content</label>
        <div className=" border border-line bg-canvas">
          {/* Toolbar */}
          <div className="no-scrollbar sticky top-16 z-20 flex flex-nowrap items-center gap-0.5 overflow-x-auto border-b border-line bg-canvas px-1.5 py-1 lg:top-0 lg:flex-wrap lg:overflow-visible">
            <ToolbarButton title="Undo" onClick={() => editor?.chain().focus().undo().run()}>
              <Icon d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
            </ToolbarButton>
            <ToolbarButton title="Redo" onClick={() => editor?.chain().focus().redo().run()}>
              <Icon d="m15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13" />
            </ToolbarButton>

            <Divider />

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
          className="w-full px-4 py-2.5 border border-line bg-surface text-ink text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {article && (
        <div className="border-t border-line pt-6">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              if (!confirm("Delete this article for good? This can't be undone.")) return;
              startTransition(async () => {
                try {
                  await deleteArticle(article.id);
                  setIsDirty(false);
                  router.push("/admin/articles");
                  router.refresh();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Couldn't delete the article.");
                }
              });
            }}
            className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-ink-muted transition-colors hover:text-accent disabled:opacity-50"
          >
            Delete article
          </button>
        </div>
      )}

      {/* Actions stay within thumb reach while writing */}
      <div className="sticky bottom-0 z-30 -mx-4 border-t border-line bg-page/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        {error && <p role="alert" className="mb-2 text-sm font-medium text-accent-ink">{error}</p>}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50 sm:flex-none"
          >
            {pendingAction === "publish"
              ? "Saving…"
              : article
                ? article.isDraft ? "Publish" : "Save changes"
                : "Publish"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => save(true)}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-line px-5 text-sm font-semibold text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50 sm:flex-none"
          >
            {pendingAction === "draft" ? "Saving…" : article && !article.isDraft ? "Unpublish" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (isDirty && !confirm("You have unsaved changes. Leave anyway?")) return;
              setIsDirty(false);
              router.push("/admin/articles");
            }}
            className="inline-flex h-11 shrink-0 items-center px-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:px-3"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>

    <div className="w-64 xl:w-72 shrink-0 sticky top-6 hidden lg:block">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">Preview</p>
      <div className=" border border-line overflow-hidden bg-card">
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
          <p className="flex items-center gap-1.5 text-xs text-ink-soft pt-1">
            By <span className="font-semibold text-ink">{selectedAuthor?.name ?? "Tollab Nation"}</span>
          </p>
          <p className="text-xs text-ink-muted">{new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
        </div>
      </div>
    </div>
    </div>
  );
}
