"use client";

import type { SubTask } from "@/components/tasks/tasks-card";

type TaskBreakdownProps = {
  taskTitle: string;
  subtasks: SubTask[];
  onToggleSubTask: (subTaskId: number) => void;
  onClose: () => void;
};

export default function TaskBreakdown({
  taskTitle,
  subtasks,
  onToggleSubTask,
  onClose,
}: TaskBreakdownProps) {
  const completedCount = subtasks.filter((subTask) => subTask.completed).length;

  const totalSubTasks = subtasks.length;

  const progress =
    totalSubTasks === 0
      ? 0
      : Math.round((completedCount / totalSubTasks) * 100);

  return (
    <section className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
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

      {/* Progress */}
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

      {/* Subtasks */}
      <div className="mt-4 space-y-2">
        {subtasks.length === 0 ? (
          <div className="rounded-xl bg-slate-50 px-3 py-4 text-center">
            <p className="text-xs font-medium text-slate-500">
              Belum ada subtask
            </p>

            <p className="mt-1 text-[11px] text-slate-400">
              AI akan membantu memecah tugas ini menjadi beberapa langkah.
            </p>
          </div>
        ) : (
          subtasks.map((subTask) => (
            <button
              key={subTask.id}
              type="button"
              onClick={() => onToggleSubTask(subTask.id)}
              className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-3 text-left transition hover:bg-slate-100"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    subTask.completed
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {subTask.completed ? "✓" : subTask.id}
                </div>

                <p
                  className={`text-xs font-medium ${
                    subTask.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-700"
                  }`}
                >
                  {subTask.title}
                </p>
              </div>

              <span
                className={`ml-3 shrink-0 text-xs ${
                  subTask.completed ? "text-slate-300" : "text-slate-400"
                }`}
              >
                {subTask.estimatedMinutes} mnt
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
