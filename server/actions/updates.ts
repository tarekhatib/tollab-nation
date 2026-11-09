"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function createQuickUpdate(payload: {
  textEn: string;
  textAr: string;
  isBreaking?: boolean;
}) {
  await requireAdmin();
  if (!payload.textEn.trim() || !payload.textAr.trim()) {
    throw new Error("Both English and Arabic text are required.");
  }

  const update = await prisma.quickUpdate.create({
    data: {
      textEn: payload.textEn.trim(),
      textAr: payload.textAr.trim(),
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
