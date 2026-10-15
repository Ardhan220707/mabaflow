"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Clock3 } from "lucide-react";
import { usePlannerStore } from "@/stores/planner-store";
import { useTaskStore } from "@/stores/task-store";
import MabaFlowCalendar from "@/components/dashboard/mabaflow-calendar";

function getTodayDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
}

function formatDateLabel(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const selectedItemId = searchParams.get("item");
  const dateFromUrl = searchParams.get("date");

  const plannerItems = usePlannerStore((state) => state.plannerItems);

  const selectedItem = plannerItems.find(
    (item) => String(item.id) === selectedItemId,
  );

  const selectedDate = dateFromUrl || selectedItem?.date || getTodayDate();

  const isToday = selectedDate === getTodayDate();

  const displayedPlannerItems = plannerItems
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const togglePlannerItem = usePlannerStore((state) => state.togglePlannerItem);

  const setSubTaskCompleted = useTaskStore(
    (state) => state.setSubTaskCompleted,
  );

  const setTaskCompleted = useTaskStore((state) => state.setTaskCompleted);

  const completedPlannerItems = displayedPlannerItems.filter(
    (item) => item.completed,
  ).length;

  const plannerProgress =
    displayedPlannerItems.length === 0
      ? 0
      : Math.round(
          (completedPlannerItems / displayedPlannerItems.length) * 100,
        );

  return (
    <main className="min-h-screen p-6">
      <section>
        <p className="text-sm text-slate-500">Daily Planner</p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">Planner</h1>

        <p className="mt-2 text-sm text-slate-500">
          Atur aktivitasmu berdasarkan waktu.
        </p>
      </section>

      <MabaFlowCalendar />

      <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {isToday ? "Progres Hari Ini" : "Progres Tanggal Dipilih"}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {formatDateLabel(selectedDate)}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {completedPlannerItems}/{displayedPlannerItems.length}
            </p>
          </div>

          <p className="text-sm font-semibold text-slate-700">
            {plannerProgress}%
          </p>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-300"
            style={{ width: `${plannerProgress}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-slate-400">
          {displayedPlannerItems.length === 0
            ? "Belum ada jadwal untuk tanggal ini."
            : completedPlannerItems === displayedPlannerItems.length
              ? "Semua jadwal pada tanggal ini selesai."
              : "Selesaikan jadwalmu satu per satu."}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Jadwal {isToday ? "Hari Ini" : "Tanggal Dipilih"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {formatDateLabel(selectedDate)}
        </p>

        <div className="mt-4 space-y-3">
          {displayedPlannerItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center">
              <p className="text-sm font-medium text-slate-600">
                Belum ada jadwal
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Jadwal untuk tanggal ini akan muncul di sini.
              </p>
            </div>
          ) : (
            displayedPlannerItems.map((item) => {
              const isSelected = String(item.id) === selectedItemId;

              return (
                <article
                  key={item.id}
                  className={`flex gap-3 rounded-2xl transition ${
                    isSelected
                      ? "bg-slate-100 p-2 ring-2 ring-slate-900"
                      : "p-2"
                  }`}
                >
                  <div className="w-16 shrink-0 pt-1">
                    <p className="text-xs font-semibold text-slate-700">
                      {item.startTime}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.endTime}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <button
                      type="button"
                      aria-label={
                        item.completed
                          ? "Tandai jadwal belum selesai"
                          : "Tandai jadwal selesai"
                      }
                      onClick={() => {
                        const nextCompleted = !item.completed;

                        if (item.subTaskId !== null) {
                          setSubTaskCompleted(
                            item.taskId,
                            item.subTaskId,
                            nextCompleted,
                          );
                        } else {
                          setTaskCompleted(item.taskId, nextCompleted);
                        }

                        togglePlannerItem(item.id);
                      }}
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
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

export default function PlannerPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen p-6">
          <p className="text-sm text-slate-500">Memuat planner...</p>
        </main>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
