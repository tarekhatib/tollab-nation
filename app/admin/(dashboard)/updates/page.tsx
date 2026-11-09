import { getAllUpdatesAdmin } from "@/server/queries/updates";
import UpdateForm from "@/components/admin/UpdateForm";
import UpdateActions from "@/components/admin/UpdateActions";

export const metadata = { title: "Updates — Admin" };

function formatTime(date: Date): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default async function AdminUpdatesPage() {
  const updates = await getAllUpdatesAdmin();

  return (
    <div className="max-w-3xl space-y-8">
      <div className="border-b-[3px] border-line-strong pb-5">
        <h1 className="display text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">Live updates</h1>
        <p className="mt-3 text-sm text-ink-muted">
          Updates appear in the homepage sidebar and expire after 48 hours. Breaking ones also appear in the ticker.
        </p>
      </div>

      <UpdateForm />

      <div className="bg-canvas border border-line overflow-hidden">
        {updates.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-soft">No updates yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {updates.map((update) => (
              <li key={update.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {update.isBreaking && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-accent px-1.5 py-0.5 rounded">
                        Breaking
                      </span>
                    )}
                    <time className="text-xs text-ink-muted">{formatTime(update.createdAt)}</time>
                  </div>
                  <p className="text-sm text-ink leading-relaxed text-right" dir="rtl">{update.textAr}</p>
                  <p className="text-sm text-ink-soft leading-relaxed mt-1">{update.textEn}</p>
                </div>
                <UpdateActions id={update.id} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
