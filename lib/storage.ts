import { put } from "@vercel/blob";

/**
 * Image storage on Vercel Blob (free on Vercel Hobby). Created from the Vercel
 * project's Storage tab, which sets BLOB_READ_WRITE_TOKEN automatically.
 * Resizing/format conversion happens at display time via the image loader.
 */
export type StorageFolder = "covers" | "content" | "ads";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

export function isStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadImage(
  data: Blob | ArrayBuffer,
  folder: StorageFolder,
  filename?: string,
  contentType?: string
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error("Image storage is not configured. Connect a Vercel Blob store (sets BLOB_READ_WRITE_TOKEN).");
  }

  const type = contentType || (data instanceof Blob ? data.type : "") || "image/jpeg";
  const ext = EXT_BY_TYPE[type] ?? "jpg";
  const base =
    (filename ?? "image")
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";

  const blob = await put(`tollabnation/${folder}/${base}.${ext}`, data, {
    access: "public",
    addRandomSuffix: true, // never overwrite an existing image
    contentType: type,
    cacheControlMaxAge: 60 * 60 * 24 * 365, // files are immutable thanks to the random suffix
  });
  return blob.url;
}

/** The current store's id, read from the token ("vercel_blob_rw_<storeId>_<secret>"). */
function storeId() {
  return process.env.BLOB_READ_WRITE_TOKEN?.split("_")[3]?.toLowerCase() || null;
}

/**
 * True for images already in *this* project's Blob store (no need to copy them).
 * Images in any other Blob store, such as the old account's, count as remote,
 * so they're copied over instead of depending on a store we no longer control.
 */
export function isManagedImage(url: string | null | undefined) {
  if (!url) return false;
  const id = storeId();
  if (!id) return /\.public\.blob\.vercel-storage\.com\//.test(url);
  return url.toLowerCase().startsWith(`https://${id}.public.blob.vercel-storage.com/`);
}
