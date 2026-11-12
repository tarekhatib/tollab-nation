import { getAllUpdatesAdmin } from "@/server/queries/updates";
import UpdateForm from "@/components/admin/UpdateForm";
import UpdateRow from "@/components/admin/UpdateRow";

export const metadata = { title: "Updates — Admin" };

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

      <div>
      {updates.length > 0 && (
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            Live now · {updates.length}
          </h2>
          <p className="text-xs text-ink-muted">
            {updates.filter((u) => u.isBreaking).length} breaking
          </p>
        </div>
      )}
      <div className="overflow-hidden border border-line bg-canvas">
        {updates.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-ink-soft">No updates yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {updates.map((update) => (
              <UpdateRow key={update.id} update={update} />
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
}
