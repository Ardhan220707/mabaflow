import { Suspense } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Sparkles,
  Target,
} from "lucide-react";
import MabaFlowCalendar from "@/components/dashboard/mabaflow-calendar";

export default function BerandaPage() {
  return (
    <main className="min-h-screen space-y-5 bg-[#F3F7F0] px-4 py-5 text-[#183D32]">
      {/* Header */}
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#668073]">
            Selamat datang kembali,
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Semangat untuk hari ini!
          </h1>
          <p className="mt-1 text-sm text-[#668073]">
            Dari deadline jadi rencana.
          </p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#DCEBDD] text-[#17664E]">
          <Target size={22} />
        </div>
      </header>

      {/* Kalender */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-[#17664E]" />
          <h2 className="font-bold">Kalender</h2>
        </div>

        <Suspense
          fallback={<div className="h-64 animate-pulse rounded-2xl bg-white" />}
        >
          <MabaFlowCalendar />
        </Suspense>
      </section>

      {/* Prioritas Hari Ini */}
      <section className="rounded-2xl border border-[#E2EAE0] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-[#668073]">Fokus utama</p>
            <h2 className="mt-1 text-lg font-bold">Prioritas Hari Ini</h2>
          </div>

          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-[#17664E]"
          >
            Lihat semua
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="mt-4 flex flex-col items-center py-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#17664E]">
            <Check size={23} />
          </div>
          <p className="mt-3 text-sm font-semibold">Belum ada tugas hari ini</p>
          <p className="mt-1 max-w-[240px] text-xs leading-5 text-[#7A8D81]">
            Tugas yang perlu kamu kerjakan akan muncul di sini.
          </p>
        </div>
      </section>

      {/* Progres Mingguan */}
      <section className="rounded-2xl border border-[#E2EAE0] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#668073]">
              Tetap konsisten
            </p>
            <h2 className="mt-1 text-lg font-bold">Progres Mingguan</h2>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF3E8] text-[#17664E]">
            <Target size={20} />
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-bold">0%</p>
            <p className="mt-1 text-xs text-[#7A8D81]">
              Tugas selesai minggu ini
            </p>
          </div>
          <p className="text-sm font-semibold text-[#668073]">0 dari 0 tugas</p>
        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-[#EAF0E7]"
          role="progressbar"
          aria-label="Progres mingguan"
          aria-valuenow={0}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full w-0 rounded-full bg-[#278568]" />
        </div>
      </section>

      {/* Saran AI */}
      <section className="rounded-2xl border border-[#DDE9DC] bg-[#E9F2E6] p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#17664E]">
            <Sparkles size={19} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#668073]">
              Rekomendasi untukmu
            </p>
            <h2 className="font-bold">Saran dari AI</h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#456454]">
          Mulai dengan menentukan tugas terpentingmu hari ini. Pecah pekerjaan
          besar menjadi langkah kecil agar lebih mudah diselesaikan.
        </p>
      </section>

      {/* Tugas Mendatang */}
      <section className="rounded-2xl border border-[#E2EAE0] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#668073]">
              Persiapkan lebih awal
            </p>
            <h2 className="mt-1 text-lg font-bold">Tugas Mendatang</h2>
          </div>

          <Clock3 size={20} className="text-[#668073]" />
        </div>

        <div className="mt-4 flex flex-col items-center py-4 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F0F4EC] text-[#668073]">
            <CalendarDays size={21} />
          </div>
          <p className="mt-3 text-sm font-semibold">
            Belum ada tugas mendatang
          </p>
          <p className="mt-1 text-xs leading-5 text-[#7A8D81]">
            Deadline terdekat akan muncul di bagian ini.
          </p>
        </div>
      </section>
    </main>
  );
}
