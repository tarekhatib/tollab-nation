"use client";

/**
 * Upload an image from the admin. Phone photos are often 3–8 MB, but serverless
 * request bodies cap at ~4.5 MB on Vercel, so photos are downscaled in the
 * browser first (longest side 2000px, JPEG/WebP ~0.85). GIFs and SVGs are sent as-is.
 */
const MAX_SIDE = 2000;
const MAX_BYTES = 4 * 1024 * 1024;

async function shrink(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp|heic|heif|avif)$/i.test(file.type) && file.type !== "") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024 && file.type !== "image/heic") {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const keepAlpha = file.type === "image/png" || file.type === "image/webp";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, keepAlpha ? "image/webp" : "image/jpeg", 0.85)
    );
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // decoding unsupported (e.g. HEIC on some browsers): try the original
  }
}

export async function uploadImage(file: File, folder: "covers" | "content" | "ads"): Promise<string> {
  const body = await shrink(file);
  if (body.size > MAX_BYTES) {
    throw new Error("This image is too large (over 4 MB). Try a smaller photo or a screenshot.");
  }
  const name = file.name.replace(/\.[^.]+$/, "") + (body.type === "image/webp" ? ".webp" : body.type === "image/jpeg" ? ".jpg" : "");
  const fd = new FormData();
  fd.append("file", body, name || "image");
  fd.append("folder", folder);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: fd });
  } catch {
    throw new Error("No connection — check your internet and try again.");
  }
  const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !json.url) {
    if (res.status === 413) throw new Error("This image is too large. Try a smaller photo.");
    if (res.status === 401) throw new Error("Your session expired. Sign in again.");
    throw new Error(json.error || "Upload failed. Try again.");
  }
  return json.url;
}
