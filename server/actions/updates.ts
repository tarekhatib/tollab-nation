"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { saveQuickUpdate } from "@/lib/quick-updates";

export async function createQuickUpdate(payload: {
  textEn: string;
  textAr: string;
  isBreaking?: boolean;
}) {
  await requireAdmin();
  return saveQuickUpdate(payload);
}

export async function deleteQuickUpdate(id: number) {
  await requireAdmin();
  await prisma.quickUpdate.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/updates");
  revalidatePath("/admin");
}
