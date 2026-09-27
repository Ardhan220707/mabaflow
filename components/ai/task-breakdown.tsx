"use client";

import { useState } from "react";

type SubTask = {
  id: number;
  title: string;
  estimatedMinutes: number;
};

type TaskBreakdownProps = {
  taskTitle: string;
  onClose: () => void;
};

const dummySubTasks: SubTask[] = [
  {
    id: 1,
    title: "Kumpulkan materi dan data",
    estimatedMinutes: 20,
  },
  {
    id: 2,
    title: "Buat struktur laporan",
    estimatedMinutes: 15,
  },
  {
    id: 3,
    title: "Tulis pembahasan",
    estimatedMinutes: 45,
  },
  {
    id: 4,
    title: "Buat kesimpulan",
    estimatedMinutes: 15,
  },
  {
    id: 5,
    title: "Rapikan dan export PDF",
    estimatedMinutes: 25,
  },
];

export default function TaskBreakdown({
  taskTitle,
  onClose,
}: TaskBreakdownProps) {
  const [completedSubTasks, setCompletedSubTasks] = useState<number[]>([]);

  const completedCount = completedSubTasks.length;
  const totalSubTasks = dummySubTasks.length;

  const progress =
    totalSubTasks === 0
      ? 0
      : Math.round((completedCount / totalSubTasks) * 100);

  function toggleSubTask(id: number) {
    setCompletedSubTasks((current) =>
      current.includes(id)
        ? current.filter((subTaskId) => subTaskId !== id)
        : [...current, id],
    );
  }

  return (
    <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">AI Breakdown</p>

          <h3 className="mt-1 text-sm font-semibold text-slate-900">
            {taskTitle}
          </h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-slate-400 hover:text-slate-700"
        >
          Tutup
        </button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Progress</span>

          <span className="text-xs font-semibold text-slate-700">
            {completedCount}/{totalSubTasks} · {progress}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-300"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {dummySubTasks.map((subTask) => {
          const isCompleted = completedSubTasks.includes(subTask.id);

          return (
            <button
              key={subTask.id}
              type="button"
              onClick={() => toggleSubTask(subTask.id)}
              className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    isCompleted
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {isCompleted ? "✓" : subTask.id}
                </div>

                <p
                  className={`text-xs font-medium ${
                    isCompleted
                      ? "text-slate-400 line-through"
                      : "text-slate-700"
                  }`}
                >
                  {subTask.title}
                </p>
              </div>

              <span
                className={`ml-3 shrink-0 text-xs ${
                  isCompleted ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {subTask.estimatedMinutes} mnt
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
