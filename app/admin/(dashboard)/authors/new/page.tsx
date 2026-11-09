import AuthorForm from "@/components/admin/AuthorForm";

export const metadata = { title: "New Author — Admin" };

export default function NewAuthorPage() {
  return (
    <div>
      <h1 className="display mb-8 border-b-[3px] border-line-strong pb-5 text-5xl uppercase leading-[0.9] text-ink sm:text-6xl">New author</h1>
      <AuthorForm />
    </div>
  );
}
