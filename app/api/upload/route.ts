import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isStorageConfigured, uploadImage } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "Image uploads aren't set up yet (Vercel Blob). Paste an image link instead." },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const raw = formData.get("folder");
    const folder =
      raw === "content" ? "content" : raw === "ads" ? "ads" : "covers";

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only images can be uploaded." }, { status: 415 });
    }

    const url = await uploadImage(file, folder, file.name, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed. Try again." }, { status: 500 });
  }
}
