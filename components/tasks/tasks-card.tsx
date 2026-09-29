"use client";

import { useState } from "react";
import { CalendarDays, Clock3, Sparkles } from "lucide-react";

import { usePlannerStore } from "@/stores/planner-store";
import TaskBreakdown from "../ai/task-breakdown";

export type SubTask = {
  id: number;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
};

export type Task = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  estimatedMinutes: number;
  expectedOutput: string;
  priority: "Rendah" | "Sedang" | "Tinggi";
  completed: boolean;
  subtasks: SubTask[];
};

type TaskCardProps = {
  task: Task;
  onToggle: (id: number) => void;
  onToggleSubTask: (taskId: number, subTaskId: number) => void;
  onAddToPlanner: (
    task: Task,
    schedule: {
      date: string;
      startTime: string;
      endTime: string;
    },
  ) => void;
};

export default function TaskCard({
  task,
  onToggle,
  onToggleSubTask,
  onAddToPlanner,
}: TaskCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const [showPlannerForm, setShowPlannerForm] = useState(false);

  const [showAIPlanner, setShowAIPlanner] = useState(false);

  const plannerItems = usePlannerStore((state) => state.plannerItems);

  const hasPlannerSchedule = plannerItems.some(
    (item) => item.date === task.dueDate,
  );

  const baseStartHour =
    task.priority === "Tinggi" ? 8 : task.priority === "Sedang" ? 13 : 16;

  const taskDurationHours = Math.ceil(task.estimatedMinutes / 60);

  const sameDayPlannerItems = plannerItems
    .filter((item) => item.date === task.dueDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  let aiStartHour = baseStartHour;

  for (const item of sameDayPlannerItems) {
    const itemEndHour = Number(item.endTime.split(":")[0]);

    if (aiStartHour < itemEndHour) {
      aiStartHour = itemEndHour;
    }
  }

  const aiStartTime = `${String(aiStartHour).padStart(2, "0")}:00`;

  const aiEndHour = aiStartHour + taskDurationHours;

  const aiEndTime = `${String(aiEndHour).padStart(2, "0")}:00`;

  const [plannerDate, setPlannerDate] = useState(task.dueDate);

  const [plannerStartTime, setPlannerStartTime] = useState("08:00");

  const [plannerEndTime, setPlannerEndTime] = useState("09:00");

  const completedSubTasks = task.subtasks.filter(
    (subTask) => subTask.completed,
  ).length;

  const totalSubTasks = task.subtasks.length;

  const subTaskProgress =
    totalSubTasks === 0
      ? 0
      : Math.round((completedSubTasks / totalSubTasks) * 100);
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
            {/* Subtask Progress */}
            {totalSubTasks > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-medium text-slate-400">
                    Progress langkah
                  </p>

                  <p className="text-[11px] font-semibold text-slate-500">
                    {completedSubTasks}/{totalSubTasks} · {subTaskProgress}%
                  </p>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-300"
                    style={{
                      width: `${subTaskProgress}%`,
                    }}
                  />
                </div>
              </div>
            )}
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

          <button
            type="button"
            onClick={() => setShowAIPlanner(true)}
            className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Sparkles size={14} />
            Atur dengan AI
          </button>

          {showAIPlanner && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Sparkles size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Rekomendasi AI
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    AI menyarankan waktu belajar berdasarkan deadline dan
                    estimasi pengerjaan.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-400">Rekomendasi jadwal</p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {task.dueDate}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {aiStartTime} - {aiEndTime} · {task.estimatedMinutes} menit
                </p>

                <p className="mt-2 text-[11px] text-slate-400">
                  {hasPlannerSchedule
                    ? "Ada jadwal lain pada tanggal ini."
                    : "Belum ada jadwal lain pada tanggal ini."}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIPlanner(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"
                >
                  Tutup
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onAddToPlanner(task, {
                      date: task.dueDate,
                      startTime: aiStartTime,
                      endTime: aiEndTime,
                    });

                    setShowAIPlanner(false);
                  }}
                  className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  Gunakan Jadwal
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPlannerForm(true)}
            className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <CalendarDays size={14} />
            Tambahkan ke Planner
          </button>

          {showPlannerForm && (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Tambahkan ke Planner
              </p>

              <div className="mt-4">
                <label className="text-xs font-medium text-slate-500">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={plannerDate}
                  onChange={(event) => setPlannerDate(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Mulai
                  </label>

                  <input
                    type="time"
                    value={plannerStartTime}
                    onChange={(event) =>
                      setPlannerStartTime(event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Selesai
                  </label>

                  <input
                    type="time"
                    value={plannerEndTime}
                    onChange={(event) => setPlannerEndTime(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlannerForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onAddToPlanner(task, {
                      date: plannerDate,
                      startTime: plannerStartTime,
                      endTime: plannerEndTime,
                    });

                    setShowPlannerForm(false);
                  }}
                  className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}

          {showBreakdown && (
            <TaskBreakdown
              taskTitle={task.title}
              subtasks={task.subtasks}
              onToggleSubTask={(subTaskId) =>
                onToggleSubTask(task.id, subTaskId)
              }
              onClose={() => setShowBreakdown(false)}
            />
          )}
        </div>
      </div>
    </article>
  );
}
