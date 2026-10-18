import { Suspense } from "react";
import MabaFlowCalendar from "@/components/dashboard/mabaflow-calendar";

export default function BerandaPage() {
  return (
    <main className="min-h-screen p-6">
      {/* Kalender */}
      <Suspense
        fallback={
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        }
      >
        <MabaFlowCalendar />
      </Suspense>

      {/* Header */}
      <section>
        <p className="text-sm text-slate-500">Selamat Datang di</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">MabaFlow</h1>
        <p className="mt-2 text-sm text-slate-500">
          Atur tugasmu, tentukan prioritas, dan mulai dari langkah berikutnya.
        </p>
      </section>

      {/* Progres hari ini */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Progres hari ini</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">0%</p>
        </div>

        <div className="mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <span className="text-sm font-semibold text-slate-600">0/0</span>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-0 rounded-full bg-slate-900" />
        </div>
      </section>

      {/* Tugas hari ini */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Tugas Hari Ini
          </h2>
          <span className="text-sm text-slate-400">0 Tugas</span>
        </div>

        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada tugas</p>
          <p className="mt-1 text-xs text-slate-400">
            Tambahkan tugas untuk mulai mengatur aktivitas.
          </p>
        </div>
      </section>

      {/* Tugas mendatang */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Tugas Mendatang
        </h2>

        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-5 text-center">
          <p className="text-sm font-medium text-slate-600">Belum ada tugas</p>
          <p className="mt-1 text-xs text-slate-400">
            Tugas dengan deadline terdekat akan muncul di sini.
          </p>
        </div>
      </section>
    </main>
  );
}
