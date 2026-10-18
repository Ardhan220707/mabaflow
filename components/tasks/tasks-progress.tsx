type TaskProgressProps = {
  completed: number;
  total: number;
};

export default function TaskProgress({ completed, total }: TaskProgressProps) {
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="mt-6 rounded-2xl border border-[#E2EAE0] bg-white p-4 shadow-[0_3px_14px_rgba(24,61,50,0.035)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#668071]">Progress tugas</p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-[#183D32]">
            {completed}
            <span className="text-[#91A398]">/{total}</span>
          </p>

          <p className="mt-1 text-xs text-[#82978A]">
            {total === 0
              ? "Belum ada tugas. Yuk, mulai susun rencanamu!"
              : completed === total
                ? "Hebat! Semua tugas sudah selesai."
                : `${total - completed} tugas lagi untuk diselesaikan`}
          </p>
        </div>

        <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#EAF3E8]">
          <p className="text-xl font-bold text-[#17664E]">{progress}%</p>
          <p className="text-[10px] font-medium text-[#668071]">Selesai</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#82978A]">
            Pencapaianmu
          </span>

          <span className="text-[11px] font-semibold text-[#347653]">
            {completed} dari {total}
          </span>
        </div>

        <div
          className="h-2 overflow-hidden rounded-full bg-[#E7EEE4]"
          role="progressbar"
          aria-label="Progress penyelesaian tugas"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#43865F] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
