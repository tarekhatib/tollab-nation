import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      {/* Room for the bottom tab bar on phones */}
      <div aria-hidden="true" className="h-[calc(5.25rem+env(safe-area-inset-bottom))] bg-footer md:hidden" />
    </>
  );
}
