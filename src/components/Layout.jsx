import { Sidebar } from "./Sidebar";

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-black text-white">
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          <div className="relative w-full min-h-screen overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 