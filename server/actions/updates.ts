"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { cleanUpdateText } from "@/lib/parse-update";
import { revalidateUpdates, saveQuickUpdate } from "@/lib/quick-updates";

export async function createQuickUpdate(payload: {
  textEn: string;
  textAr: string;
  isBreaking?: boolean;
}) {
  await requireAdmin();
  return saveQuickUpdate(payload);
}

/** Edit an update's text and/or breaking flag. Omitted fields stay as they are. */
export async function updateQuickUpdate(
  id: number,
  payload: { textEn?: string; textAr?: string; isBreaking?: boolean },
) {
  await requireAdmin();
  const data: { textEn?: string; textAr?: string; isBreaking?: boolean } = {};
  if (payload.textEn !== undefined) data.textEn = cleanUpdateText(payload.textEn);
  if (payload.textAr !== undefined) data.textAr = cleanUpdateText(payload.textAr);
  if (data.textEn === "" || data.textAr === "") {
    throw new Error("Both English and Arabic text are required.");
  }
  if (payload.isBreaking !== undefined) data.isBreaking = payload.isBreaking;

  const update = await prisma.quickUpdate.update({ where: { id }, data });
  revalidateUpdates();
  return update;
}

export async function deleteQuickUpdate(id: number) {
  await requireAdmin();
  await prisma.quickUpdate.delete({ where: { id } });
  revalidateUpdates();
}
