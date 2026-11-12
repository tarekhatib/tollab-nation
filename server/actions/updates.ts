"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cleanUpdateText } from "@/lib/parse-update";

export async function createQuickUpdate(payload: {
  textEn: string;
  textAr: string;
  isBreaking?: boolean;
}) {
  await requireAdmin();
  // Same cleanup the form previews, so stray asterisks or emoji never reach the site.
  const textEn = cleanUpdateText(payload.textEn);
  const textAr = cleanUpdateText(payload.textAr);
  if (!textEn || !textAr) {
    throw new Error("Both English and Arabic text are required.");
  }

  const update = await prisma.quickUpdate.create({
    data: {
      textEn,
      textAr,
      isBreaking: payload.isBreaking ?? false,
    },
  });

  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath("/admin");
  return update;
}

export async function deleteQuickUpdate(id: number) {
  await requireAdmin();
  await prisma.quickUpdate.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath("/admin");
}
