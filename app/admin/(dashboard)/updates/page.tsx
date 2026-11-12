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

      <div className="bg-canvas border border-line overflow-hidden">
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
  );
}
