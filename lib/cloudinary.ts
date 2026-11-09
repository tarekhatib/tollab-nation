const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

export async function uploadImage(
  data: Blob | ArrayBuffer,
  folder: "covers" | "content" | "ads",
  filename?: string
) {
  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const form = new FormData();
  form.append("file", data instanceof Blob ? data : new Blob([data]));
  form.append("upload_preset", uploadPreset);
  form.append("folder", `tollabnation/${folder}`);
  if (filename) form.append("public_id", filename.replace(/\.[^/.]+$/, ""));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed with status ${response.status}.`);
  }

  const result: unknown = await response.json();
  if (
    !result ||
    typeof result !== "object" ||
    !("secure_url" in result) ||
    typeof result.secure_url !== "string"
  ) {
    throw new Error("Cloudinary returned an invalid upload response.");
  }

  return result.secure_url;
}

export function isManagedImage(url: string | null | undefined) {
  return !!url && url.includes("res.cloudinary.com");
}
