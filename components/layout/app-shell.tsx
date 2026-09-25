import BottomNav from "./bottom-nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screnn bg-slate-50">
      <main className="mx-auto min-h-screnn w-full max-1-md bg-white pb-24 shadow-sm">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
