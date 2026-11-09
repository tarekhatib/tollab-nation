import { prisma } from "@/lib/prisma";
import AdForm from "@/components/admin/AdForm";

export const metadata = { title: "New Ad — Admin" };

export default async function NewAdPage() {
  const articles = await prisma.article.findMany({
    where: { isDraft: false },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <h1 className="display mb-8 border-b-[3px] border-line-strong pb-5 text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">New ad</h1>
      <AdForm articles={articles} />
    </div>
  );
}
