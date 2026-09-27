"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import { usePlannerStore } from "@/stores/planner-store";
import { useTaskStore } from "@/stores/task-store";

export default function PlannerPage() {
  const plannerItems = usePlannerStore((state) => state.plannerItems);

  const togglePlannerItem = usePlannerStore((state) => state.togglePlannerItem);

  const setSubTaskCompleted = useTaskStore(
    (state) => state.setSubTaskCompleted,
  );

  const completedPlannerItems = plannerItems.filter(
    (item) => item.completed,
  ).length;

  const plannerProgress =
    plannerItems.length === 0
      ? 0
      : Math.round((completedPlannerItems / plannerItems.length) * 100);

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <section>
        <p className="text-sm text-slate-500">Daily Planner</p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">Planner</h1>

        <p className="mt-2 text-sm text-slate-500">
          Atur aktivitasmu berdasarkan waktu.
        </p>
      </section>

      {/* Tanggal */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <CalendarDays size={20} />
          </div>

          <div>
            <p className="text-xs text-slate-300">Hari ini</p>

            <p className="mt-1 text-sm font-semibold">28 September 2026</p>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Progress Hari Ini
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {completedPlannerItems}/{plannerItems.length}
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-700">
            {plannerProgress}%
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-300"
            style={{
              width: `${plannerProgress}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {completedPlannerItems === plannerItems.length &&
          plannerItems.length > 0
            ? "Semua jadwal hari ini selesai."
            : "Selesaikan jadwalmu satu per satu."}
        </p>
      </section>

      {/* Timeline */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Jadwal Hari Ini
        </h2>

        <div className="mt-4 space-y-3">
          {plannerItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm font-medium text-slate-600">
                Belum ada jadwal
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Jadwal yang dibuat akan muncul di sini.
              </p>
            </div>
          ) : (
            plannerItems.map((item) => (
              <article key={item.id} className="flex gap-3">
                {/* Waktu */}
                <div className="w-16 shrink-0 pt-3">
                  <p className="text-xs font-semibold text-slate-700">
                    {item.startTime}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-400">
                    {item.endTime}
                  </p>
                </div>

                {/* Jadwal */}
                {/* <div
                  className={`min-w-0 flex-1 rounded-2xl border p-4 ${
                    item.completed
                      ? "border-slate-200 bg-slate-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const nextCompleted = !item.completed;

                      togglePlannerItem(item.id);

                      if (item.subTaskId !== null) {
                        setSubTaskCompleted(
                          item.taskId,
                          item.subTaskId,
                          nextCompleted,
                        );
                      }
                    }}
                  >
                    {item.completed && (
                      <span className="text-xs text-white">✓</span>
                    )}
                  </button>

                  <h3 className="text-sm font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                    <Clock3 size={13} />

                    <span>
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                </div> */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const nextCompleted = !item.completed;

                      togglePlannerItem(item.id);

                      if (item.subTaskId !== null) {
                        setSubTaskCompleted(
                          item.taskId,
                          item.subTaskId,
                          nextCompleted,
                        );
                      }
                    }}
                    aria-label={
                      item.completed
                        ? "Tandai jadwal belum selesai"
                        : "Tandai jadwal selesai"
                    }
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      item.completed
                        ? "border-slate-900 bg-slate-900"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {item.completed && (
                      <span className="text-xs font-semibold text-white">
                        ✓
                      </span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-semibold ${
                        item.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <Clock3 size={13} />

                      <span>
                        {item.startTime} - {item.endTime}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
