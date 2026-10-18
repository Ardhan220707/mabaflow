"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Clock3, CalendarDays, Check } from "lucide-react";
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
  const togglePlannerItem = usePlannerStore((state) => state.togglePlannerItem);

  const setSubTaskCompleted = useTaskStore(
    (state) => state.setSubTaskCompleted,
  );
  const setTaskCompleted = useTaskStore((state) => state.setTaskCompleted);

  const selectedItem = plannerItems.find(
    (item) => String(item.id) === selectedItemId,
  );

  const selectedDate = dateFromUrl || selectedItem?.date || getTodayDate();
  const isToday = selectedDate === getTodayDate();

  const displayedPlannerItems = plannerItems
    .filter((item) => item.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const completedPlannerItems = displayedPlannerItems.filter(
    (item) => item.completed,
  ).length;

  const totalPlannerItems = displayedPlannerItems.length;

  const plannerProgress =
    totalPlannerItems === 0
      ? 0
      : Math.round((completedPlannerItems / totalPlannerItems) * 100);

  return (
    <main className="min-h-screen bg-[#F3F7F0] p-5 pb-28">
      {/* Header */}
      <section className="mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCEBDD] text-[#17664E]">
            <CalendarDays size={22} />
          </div>

          <div>
            <p className="text-xs font-medium text-[#668071]">Daily Planner</p>
            <h1 className="mt-0.5 text-2xl font-bold text-[#183D32]">
              Planner
            </h1>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-[#668071]">
          Atur aktivitasmu dan jalani hari dengan lebih terencana.
        </p>
      </section>

      {/* Kalender */}
      <section className="overflow-hidden rounded-2xl border border-[#E2EAE0] bg-white p-3 shadow-[0_3px_14px_rgba(24,61,50,0.035)]">
        <Suspense
          fallback={
            <p className="p-4 text-sm text-[#668071]">Memuat kalender...</p>
          }
        >
          <MabaFlowCalendar />
        </Suspense>
      </section>

      {/* Progress */}
      <section className="mt-4 rounded-2xl border border-[#E2EAE0] bg-white p-4 shadow-[0_3px_14px_rgba(24,61,50,0.035)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#355746]">
              {isToday ? "Progress Hari Ini" : "Progress Tanggal Dipilih"}
            </p>

            <p className="mt-1 text-xs text-[#82978A]">
              {formatDateLabel(selectedDate)}
            </p>

            <p className="mt-2 text-2xl font-bold text-[#183D32]">
              {completedPlannerItems}
              <span className="text-[#91A398]">/{totalPlannerItems}</span>
            </p>

            <p className="mt-1 text-xs text-[#82978A]">
              {totalPlannerItems === 0
                ? "Belum ada jadwal untuk tanggal ini."
                : completedPlannerItems === totalPlannerItems
                  ? "Semua jadwal sudah selesai!"
                  : `${totalPlannerItems - completedPlannerItems} jadwal lagi untuk diselesaikan`}
            </p>
          </div>

          <div className="flex h-[68px] w-[68px] shrink-0 flex-col items-center justify-center rounded-2xl bg-[#EAF3E8]">
            <span className="text-xl font-bold text-[#17664E]">
              {plannerProgress}%
            </span>
            <span className="text-[10px] font-medium text-[#668071]">
              Selesai
            </span>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E7EEE4]">
          <div
            className="h-full rounded-full bg-[#43865F] transition-all duration-500"
            style={{ width: `${plannerProgress}%` }}
          />
        </div>
      </section>

      {/* Daftar jadwal */}
      <section className="mt-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#183D32]">
              Jadwal {isToday ? "Hari Ini" : "Pilihanmu"}
            </h2>
            <p className="mt-1 text-xs text-[#82978A]">
              {formatDateLabel(selectedDate)}
            </p>
          </div>

          <span className="rounded-full bg-[#E4F1E5] px-3 py-1.5 text-xs font-semibold text-[#347653]">
            {totalPlannerItems} jadwal
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {totalPlannerItems === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#C9D9C7] bg-white px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#43865F]">
                <CalendarDays size={23} />
              </div>

              <p className="mt-3 text-sm font-semibold text-[#355746]">
                Belum ada jadwal
              </p>

              <p className="mx-auto mt-1 max-w-[240px] text-xs leading-5 text-[#82978A]">
                Jadwal tugas yang kamu tambahkan akan muncul di sini.
              </p>
            </div>
          ) : (
            displayedPlannerItems.map((item) => {
              const isSelected = String(item.id) === selectedItemId;

              return (
                <article
                  key={item.id}
                  className={`flex gap-3 rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-[#8DB99A] bg-[#F0F7EF] ring-1 ring-[#B9D6BC]"
                      : "border-[#E2EAE0] bg-white"
                  }`}
                >
                  {/* Waktu */}
                  <div className="w-[58px] shrink-0 border-r border-[#E2EAE0] pr-3 pt-0.5">
                    <p className="text-xs font-bold text-[#355746]">
                      {item.startTime}
                    </p>
                    <p className="mt-1 text-[11px] text-[#82978A]">
                      {item.endTime}
                    </p>
                  </div>

                  {/* Detail dan checkbox */}
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
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                        item.completed
                          ? "border-[#17664E] bg-[#17664E] text-white"
                          : "border-[#B8C9B7] bg-white hover:border-[#17664E]"
                      }`}
                    >
                      {item.completed && <Check size={13} strokeWidth={3} />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`break-words text-sm font-semibold leading-5 ${
                          item.completed
                            ? "text-[#91A398] line-through"
                            : "text-[#183D32]"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#82978A]">
                        <Clock3 size={13} className="text-[#70947A]" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>

                      {item.completed && (
                        <span className="mt-2 inline-block rounded-full bg-[#E4F1E5] px-2 py-1 text-[10px] font-semibold text-[#347653]">
                          Selesai
                        </span>
                      )}
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
        <main className="min-h-screen bg-[#F3F7F0] p-6">
          <p className="text-sm text-[#668071]">Memuat planner...</p>
        </main>
      }
    >
      <PlannerContent />
    </Suspense>
  );
}
