"use client";

import { useState } from "react";
import { CalendarDays, Clock3, Sparkles, Check } from "lucide-react";

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

  const priorityStyle =
    task.priority === "Tinggi"
      ? "bg-red-50 text-red-600"
      : task.priority === "Sedang"
        ? "bg-amber-50 text-amber-700"
        : "bg-[#E4F1E5] text-[#347653]";

  const secondaryButton =
    "flex items-center justify-center gap-2 rounded-xl border border-[#DCE7DA] bg-white px-3 py-2.5 text-xs font-medium text-[#456454] transition hover:border-[#A9C9AE] hover:bg-[#F3F7F0]";

  const inputStyle =
    "mt-1 w-full rounded-xl border border-[#DCE7DA] bg-white px-3 py-2.5 text-sm text-[#183D32] outline-none transition focus:border-[#6C9F7A] focus:ring-2 focus:ring-[#DCEBDD]";

  return (
    <article
      className={`rounded-2xl border p-4 shadow-[0_3px_14px_rgba(24,61,50,0.035)] transition-colors ${
        task.completed
          ? "border-[#E1E9DF] bg-[#F8FAF6]"
          : "border-[#E2EAE0] bg-white"
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
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
            task.completed
              ? "border-[#17664E] bg-[#17664E] text-white"
              : "border-[#B8C9B7] bg-white hover:border-[#17664E]"
          }`}
        >
          {task.completed && <Check size={13} strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          {/* Judul dan prioritas */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3
                className={`break-words text-sm font-semibold leading-5 ${
                  task.completed
                    ? "text-[#91A398] line-through"
                    : "text-[#183D32]"
                }`}
              >
                {task.title}
              </h3>

              <p className="mt-1 text-xs text-[#82978A]">{task.course}</p>
            </div>

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityStyle}`}
            >
              {task.priority}
            </span>
          </div>

          {/* Deadline dan estimasi */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#82978A]">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-[#70947A]" />
              <span>{task.dueDate}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-[#70947A]" />
              <span>{task.estimatedMinutes} menit</span>
            </div>
          </div>

          {/* Output dan progress subtugas */}
          <div className="mt-3 rounded-xl bg-[#F4F7F1] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#82978A]">
              Output tugas
            </p>

            <p className="mt-1 text-xs leading-5 text-[#456454]">
              {task.expectedOutput}
            </p>

            {totalSubTasks > 0 && (
              <div className="mt-3 border-t border-[#E2EAE0] pt-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-medium text-[#668071]">
                    Progress langkah
                  </p>

                  <p className="text-[11px] font-semibold text-[#347653]">
                    {completedSubTasks}/{totalSubTasks} · {subTaskProgress}%
                  </p>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DFE9DC]">
                  <div
                    className="h-full rounded-full bg-[#43865F] transition-all duration-300"
                    style={{ width: `${subTaskProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Tombol AI */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowBreakdown((current) => !current)}
              className={secondaryButton}
            >
              <Sparkles size={14} className="text-[#43865F]" />
              {showBreakdown ? "Tutup Breakdown" : "Breakdown dengan AI"}
            </button>

            <button
              type="button"
              onClick={() => setShowAIPlanner(true)}
              className={secondaryButton}
            >
              <Sparkles size={14} className="text-[#43865F]" />
              Atur dengan AI
            </button>
          </div>

          {/* Rekomendasi AI */}
          {showAIPlanner && (
            <div className="mt-3 rounded-2xl border border-[#DCE7DA] bg-[#F4F7F1] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DCEBDD] text-[#17664E]">
                  <Sparkles size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#183D32]">
                    Rekomendasi AI
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#668071]">
                    Rekomendasi waktu belajar berdasarkan deadline, prioritas,
                    dan estimasi pengerjaan.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#E2EAE0] bg-white p-3">
                <p className="text-xs text-[#82978A]">Rekomendasi jadwal</p>

                <p className="mt-1 text-sm font-semibold text-[#183D32]">
                  {task.dueDate}
                </p>

                <p className="mt-1 text-xs text-[#456454]">
                  {aiStartTime} - {aiEndTime} · {task.estimatedMinutes} menit
                </p>

                <p className="mt-2 text-[11px] text-[#82978A]">
                  {hasPlannerSchedule
                    ? "Terdapat jadwal lain pada tanggal ini."
                    : "Belum ada jadwal lain pada tanggal ini."}
                </p>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAIPlanner(false)}
                  className="flex-1 rounded-xl border border-[#DCE7DA] bg-white px-3 py-2.5 text-xs font-medium text-[#456454] transition hover:bg-[#F8FAF6]"
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
                  className="flex-1 rounded-xl bg-[#17664E] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#12543F]"
                >
                  Gunakan Jadwal
                </button>
              </div>
            </div>
          )}

          {/* Tambahkan ke Planner */}
          <button
            type="button"
            onClick={() => setShowPlannerForm(true)}
            className={`${secondaryButton} mt-2`}
          >
            <CalendarDays size={14} className="text-[#43865F]" />
            Tambahkan ke Planner
          </button>

          {showPlannerForm && (
            <div className="mt-3 rounded-2xl border border-[#DCE7DA] bg-[#F4F7F1] p-4">
              <p className="text-sm font-semibold text-[#183D32]">
                Tambahkan ke Planner
              </p>

              <div className="mt-4">
                <label className="text-xs font-medium text-[#668071]">
                  Tanggal
                </label>

                <input
                  type="date"
                  value={plannerDate}
                  onChange={(event) => setPlannerDate(event.target.value)}
                  className={inputStyle}
                />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#668071]">
                    Mulai
                  </label>

                  <input
                    type="time"
                    value={plannerStartTime}
                    onChange={(event) =>
                      setPlannerStartTime(event.target.value)
                    }
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-[#668071]">
                    Selesai
                  </label>

                  <input
                    type="time"
                    value={plannerEndTime}
                    onChange={(event) => setPlannerEndTime(event.target.value)}
                    className={inputStyle}
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlannerForm(false)}
                  className="flex-1 rounded-xl border border-[#DCE7DA] bg-white px-3 py-2.5 text-xs font-medium text-[#456454]"
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
                  className="flex-1 rounded-xl bg-[#17664E] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#12543F]"
                >
                  Simpan
                </button>
              </div>
            </div>
          )}

          {/* AI Breakdown */}
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
