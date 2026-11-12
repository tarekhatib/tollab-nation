import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cleanUpdateText } from "@/lib/parse-update";

/**
 * Saves a quick update after the same cleanup the admin form previews, so stray
 * asterisks, emoji or links never reach the site. Shared by the admin server
 * action and the WhatsApp ingest endpoint.
 */
export async function saveQuickUpdate(payload: {
  textEn: string;
  textAr: string;
  isBreaking?: boolean;
}) {
  const textEn = cleanUpdateText(payload.textEn);
  const textAr = cleanUpdateText(payload.textAr);
  if (!textEn || !textAr) {
    throw new Error("Both English and Arabic text are required.");
  }

  const update = await prisma.quickUpdate.create({
    data: { textEn, textAr, isBreaking: payload.isBreaking ?? false },
  });

  revalidateUpdates();
  return update;
}

/** Every page that shows live updates: homepage sidebar/ticker, /updates, admin. */
export function revalidateUpdates() {
  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath("/admin");
  revalidatePath("/admin/updates");
}
