/** Re-mounts on every navigation so the page can animate in (see .page-enter in globals.css). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter flex-1">{children}</div>;
}
