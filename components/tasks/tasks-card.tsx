"use client";

import { useState } from "react";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";
import TaskBreakdown from "../ai/task-breakdown";

export type Task = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  estimatedMinutes: number;
  expectedOutput: string;
  priority: "Rendah" | "Sedang" | "Tinggi";
  completed: boolean;
};

type TaskCardProps = {
  task: Task;
  onToggle: (id: number) => void;
};

export default function TaskCard({ task, onToggle }: TaskCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  return (
    <article
      className={`rounded-2xl border p-4 ${
        task.completed
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex gap-3">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={
            task.completed ? "Tandai belum selesai" : "Tandai selesai"
          }
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
            task.completed
              ? "border-slate-900 bg-slate-900"
              : "border-slate-300 bg-white"
          }`}
        >
          {task.completed && <span className="text-xs text-white">✓</span>}
        </button>

        {/* Informasi */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3
                className={`text-sm font-semibold ${
                  task.completed
                    ? "text-slate-400 line-through"
                    : "text-slate-900"
                }`}
              >
                {task.title}
              </h3>

              <p className="mt-1 text-xs text-slate-500">{task.course}</p>
            </div>

            {/* Priority */}
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                task.priority === "Tinggi"
                  ? "bg-red-50 text-red-600"
                  : task.priority === "Sedang"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {task.priority}
            </span>
          </div>

          {/* Metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <CalendarDays size={14} />
              <span>{task.dueDate}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock3 size={14} />
              <span>{task.estimatedMinutes} menit</span>
            </div>
          </div>

          {/* Expected Output */}
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium text-slate-400">Output</p>

            <p className="mt-1 text-xs font-medium text-slate-600">
              {task.expectedOutput}
            </p>
          </div>

          {/* AI Breakdown */}
          <button
            type="button"
            onClick={() => setShowBreakdown((current) => !current)}
            className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Sparkles size={14} />
            {showBreakdown ? "Tutup AI Breakdown" : "Breakdown dengan AI"}
          </button>

          {showBreakdown && (
            <TaskBreakdown
              taskTitle={task.title}
              onClose={() => setShowBreakdown(false)}
            />
          )}

          {/* Expected Output */}
          <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium text-slate-400">Output</p>

            <p className="mt-1 text-xs font-medium text-slate-600">
              {task.expectedOutput}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
