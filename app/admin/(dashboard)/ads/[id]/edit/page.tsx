import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdById } from "@/server/queries/ads";
import AdForm from "@/components/admin/AdForm";

export const metadata = { title: "Edit Ad — Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function EditAdPage({ params }: Props) {
  const { id } = await params;
  const adId = parseInt(id);
  if (isNaN(adId)) notFound();

  const [ad, articles] = await Promise.all([
    getAdById(adId),
    prisma.article.findMany({
      where: { isDraft: false },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!ad) notFound();

  return (
    <div>
      <h1 className="display mb-8 border-b-[3px] border-line-strong pb-5 text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Edit ad</h1>
      <AdForm articles={articles} ad={ad} />
    </div>
  );
}
