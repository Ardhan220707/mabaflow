type TaskProgressProps = {
  completed: number;
  total: number;
};

export default function TaskProgress({ completed, total }: TaskProgressProps) {
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Progress tugas</p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {completed}/{total}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-400">Selesai</p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {progress}%
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </section>
  );
}
