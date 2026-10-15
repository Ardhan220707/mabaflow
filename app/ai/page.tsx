"use client";

import { useState } from "react";
import { Check, Plus, Send, CalendarClock, Trash2 } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { usePlannerStore } from "@/stores/planner-store";
import type { PlannerItem } from "@/stores/planner-store";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type AiTask = {
  title: string;
  course: string;
  dueDate: string;
  estimatedMinutes: number;
  expectedOutput: string;
  priority: "Rendah" | "Sedang" | "Tinggi";
  subtasks: {
    id: number;
    title: string;
    estimatedMinutes: number;
    completed: boolean;
  }[];
};

type ScheduleDraft = {
  taskId: number;
  subTaskId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  estimatedMinutes: number;
  rationale: string;
};

type ScheduleResponse = {
  type: "schedule";
  schedules: ScheduleDraft[];
  conflicts: string[];
  notes: string[];
};

function getLocalDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

export default function AiPage() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Halo, aku siap bantu. Ceritakan tugas, deadline, atau aktivitas yang sedang kamu hadapi.",
    },
  ]);

  const [generatedTask, setGeneratedTask] = useState<AiTask | null>(null);
  const [taskAdded, setTaskAdded] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);

  const plannerItems = usePlannerStore((state) => state.plannerItems);
  const addPlannerItem = usePlannerStore((state) => state.addPlannerItem);

  const [plannerDate, setPlannerDate] = useState(getLocalDate());
  const [freeStart, setFreeStart] = useState("08:00");
  const [freeEnd, setFreeEnd] = useState("10:00");

  const [preferredStart, setPreferredStart] = useState("08:00");
  const [preferredEnd, setPreferredEnd] = useState("17:00");

  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  const [scheduleDraft, setScheduleDraft] = useState<ScheduleResponse | null>(
    null,
  );

  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const handleSend = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || chatLoading) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        content: trimmedMessage,
      },
    ]);

    setMessage("");
    setTaskAdded(false);
    setGeneratedTask(null);
    setChatLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan.");
      }

      const parsed = (
        typeof data.result === "string" ? JSON.parse(data.result) : data.result
      ) as {
        type?: string;
        title?: string;
        course?: string;
        dueDate?: string;
        estimatedMinutes?: number;
        expectedOutput?: string;
        priority?: "Rendah" | "Sedang" | "Tinggi";
        subtasks?: {
          title: string;
          estimatedMinutes: number;
        }[];
      };

      if (parsed.type === "task" && parsed.title) {
        setGeneratedTask({
          title: parsed.title,
          course: parsed.course || "",
          dueDate: parsed.dueDate || "",
          estimatedMinutes: parsed.estimatedMinutes || 0,
          expectedOutput: parsed.expectedOutput || parsed.title,
          priority: parsed.priority || "Sedang",

          subtasks: (parsed.subtasks || []).map((subtask, index) => ({
            id: index + 1,
            title: subtask.title,
            estimatedMinutes: subtask.estimatedMinutes,
            completed: false,
          })),
        });

        setMessages((current) => [
          ...current,
          {
            id: Date.now() + 1,
            role: "assistant",
            content:
              "Aku sudah menyusun tugasmu. Periksa kartu tugas di bawah sebelum menambahkannya.",
          },
        ]);
      } else {
        setMessages((current) => [
          ...current,
          {
            id: Date.now() + 1,
            role: "assistant",
            content:
              parsed.expectedOutput ||
              parsed.title ||
              "Aku siap membantu mengatur tugas dan jadwalmu.",
          },
        ]);
      }
    } catch (error) {
      console.error("AI request error:", error);

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Maaf, aku belum bisa memproses pesanmu.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddTask = () => {
    if (!generatedTask || taskAdded) return;

    addTask({
      id: Date.now(),
      title: generatedTask.title,
      course: generatedTask.course,
      dueDate: generatedTask.dueDate,
      estimatedMinutes: generatedTask.estimatedMinutes,
      expectedOutput: generatedTask.expectedOutput,
      priority: generatedTask.priority,
      completed: false,
      subtasks: generatedTask.subtasks,
    });

    setTaskAdded(true);
  };

  const handleGenerateSchedule = async () => {
    setScheduleError("");
    setScheduleSaved(false);
    setScheduleDraft(null);

    if (!isValidDateString(plannerDate) || freeStart >= freeEnd) {
      setScheduleError("Periksa tanggal dan rentang waktu luangmu.");
      return;
    }

    if (
      preferredStart >= preferredEnd ||
      sessionMinutes < 5 ||
      sessionMinutes > 180 ||
      breakMinutes < 0 ||
      breakMinutes > 60
    ) {
      setScheduleError("Periksa kembali preferensi belajar.");
      return;
    }

    if (freeStart < preferredStart || freeEnd > preferredEnd) {
      setScheduleError(
        "Waktu luang harus berada di dalam rentang preferensi belajar.",
      );
      return;
    }

    const availableTasks = tasks
      .filter((task) => !task.completed)
      .map((task) => ({
        ...task,
        subtasks: task.subtasks.filter(
          (subtask) =>
            !subtask.completed &&
            !plannerItems.some(
              (item) =>
                item.taskId === task.id && item.subTaskId === subtask.id,
            ),
        ),
      }))
      .filter((task) => task.subtasks.length > 0);

    if (availableTasks.length === 0) {
      setScheduleError(
        "Tidak ada subtugas belum selesai yang belum memiliki jadwal.",
      );
      return;
    }

    const overlappingExisting = plannerItems.filter(
      (item) =>
        item.date === plannerDate &&
        item.startTime < freeEnd &&
        freeStart < item.endTime,
    );

    if (overlappingExisting.length > 0) {
      setScheduleError(
        "Rentang waktu yang dipilih bertabrakan dengan jadwal yang sudah ada. Pilih waktu luang lain.",
      );
      return;
    }

    setScheduleLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "schedule",

          message:
            "Buat draft jadwal untuk subtugas yang belum selesai dan belum memiliki jadwal. Jangan mengubah jadwal lama atau menjadwalkan subtugas yang sudah memiliki jadwal.",

          tasks: availableTasks,

          preferences: {
            preferredStartTime: preferredStart,
            preferredEndTime: preferredEnd,
            sessionMinutes,
            breakMinutes,
          },

          availability: [
            {
              date: plannerDate,
              startTime: freeStart,
              endTime: freeEnd,
            },
          ],

          existingSchedules: plannerItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat draft jadwal.");
      }

      const parsed = (
        typeof data.result === "string" ? JSON.parse(data.result) : data.result
      ) as ScheduleResponse;

      if (
        parsed.type !== "schedule" ||
        !Array.isArray(parsed.schedules) ||
        !Array.isArray(parsed.conflicts) ||
        !Array.isArray(parsed.notes)
      ) {
        throw new Error("Format respons jadwal dari AI tidak valid.");
      }

      setScheduleDraft(parsed);
    } catch (error) {
      setScheduleError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat jadwal.",
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  const updateDraftItem = (
    index: number,
    field: "date" | "startTime" | "endTime",
    value: string,
  ) => {
    setScheduleDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        schedules: current.schedules.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      };
    });

    setScheduleSaved(false);
    setScheduleError("");
  };

  const removeDraftItem = (index: number) => {
    setScheduleDraft((current) => {
      if (!current) return current;

      return {
        ...current,
        schedules: current.schedules.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });

    setScheduleSaved(false);
    setScheduleError("");
  };

  const handleApproveSchedule = () => {
    if (!scheduleDraft || scheduleDraft.schedules.length === 0) {
      setScheduleError("Tidak ada jadwal untuk disimpan.");
      return;
    }

    setScheduleError("");

    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const newItems: PlannerItem[] = [];
    const usedSubtasks = new Set<string>();

    for (const [index, draft] of scheduleDraft.schedules.entries()) {
      const task = taskMap.get(draft.taskId);

      const subtask = task?.subtasks.find(
        (item) => item.id === draft.subTaskId,
      );

      if (!task || task.completed || !subtask || subtask.completed) {
        setScheduleError(
          `Subtugas "${draft.title}" tidak tersedia atau sudah selesai.`,
        );
        return;
      }

      if (
        !isValidDateString(draft.date) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.startTime) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.endTime)
      ) {
        setScheduleError("Tanggal atau format waktu tidak valid.");
        return;
      }

      const start = timeToMinutes(draft.startTime);
      const end = timeToMinutes(draft.endTime);

      if (
        end <= start ||
        end - start !== draft.estimatedMinutes ||
        draft.estimatedMinutes !== subtask.estimatedMinutes
      ) {
        setScheduleError(
          `Periksa durasi jadwal "${draft.title}". Durasi harus sesuai dengan estimasi subtugas.`,
        );
        return;
      }

      if (
        draft.date !== plannerDate ||
        draft.startTime < freeStart ||
        draft.endTime > freeEnd ||
        draft.startTime < preferredStart ||
        draft.endTime > preferredEnd
      ) {
        setScheduleError(
          `Jadwal "${draft.title}" berada di luar waktu yang dipilih.`,
        );
        return;
      }

      // Periksa deadline hanya jika format tanggalnya valid.
      const hasValidDueDate = isValidDateString(task.dueDate);

      if (hasValidDueDate && draft.date > task.dueDate) {
        setScheduleError(`Jadwal "${draft.title}" melewati deadline tugasnya.`);
        return;
      }

      // Cegah subtugas yang sama muncul dua kali dalam draft.
      const subtaskKey = `${draft.taskId}-${draft.subTaskId}`;

      if (usedSubtasks.has(subtaskKey)) {
        setScheduleError(
          `Subtugas "${draft.title}" muncul lebih dari sekali dalam draft.`,
        );
        return;
      }

      // Cegah subtugas yang sudah memiliki jadwal disimpan ulang.
      const alreadyScheduled = plannerItems.some(
        (item) =>
          item.taskId === draft.taskId && item.subTaskId === draft.subTaskId,
      );

      if (alreadyScheduled) {
        setScheduleError(
          `Subtugas "${draft.title}" sudah memiliki jadwal di Planner.`,
        );
        return;
      }

      usedSubtasks.add(subtaskKey);

      newItems.push({
        id: Date.now() + index,
        taskId: draft.taskId,
        subTaskId: draft.subTaskId,
        title: subtask.title,
        date: draft.date,
        startTime: draft.startTime,
        endTime: draft.endTime,
        completed: false,
      });
    }

    // Pastikan jadwal baru tidak bertabrakan dengan jadwal lama
    // maupun dengan jadwal lain dalam draft.
    const allItems = [...plannerItems, ...newItems];

    for (let i = 0; i < allItems.length; i++) {
      for (let j = i + 1; j < allItems.length; j++) {
        const first = allItems[i];
        const second = allItems[j];

        if (
          first.date === second.date &&
          first.startTime < second.endTime &&
          second.startTime < first.endTime
        ) {
          setScheduleError(
            `Jadwal "${first.title}" dan "${second.title}" bertabrakan.`,
          );
          return;
        }
      }
    }

    for (const item of newItems) {
      addPlannerItem(item);
    }

    setScheduleSaved(true);
  };

  return (
    <main className="min-h-screen p-6 pb-28">
      <section>
        <p className="text-sm text-slate-500">MabaFlow Assistant</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">AI Assistant</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ceritakan tugas atau masalahmu. Aku bantu mengaturnya.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <CalendarClock size={20} className="text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-900">AI Planner</h2>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Tentukan waktu luang dan preferensi belajar untuk membuat draft jadwal
          yang bisa kamu periksa sebelum disimpan.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Tanggal belajar
            </label>
            <input
              type="date"
              value={plannerDate}
              onChange={(event) => setPlannerDate(event.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Waktu luang mulai
              </label>
              <input
                type="time"
                value={freeStart}
                onChange={(event) => setFreeStart(event.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Waktu luang selesai
              </label>
              <input
                type="time"
                value={freeEnd}
                onChange={(event) => setFreeEnd(event.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Preferensi belajar
            </h3>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Mulai belajar
                </label>
                <input
                  type="time"
                  value={preferredStart}
                  onChange={(event) => setPreferredStart(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Selesai belajar
                </label>
                <input
                  type="time"
                  value={preferredEnd}
                  onChange={(event) => setPreferredEnd(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Durasi sesi (menit)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={sessionMinutes}
                  onChange={(event) =>
                    setSessionMinutes(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Istirahat (menit)
                </label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={breakMinutes}
                  onChange={(event) =>
                    setBreakMinutes(Number(event.target.value))
                  }
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {tasks.filter((task) => !task.completed).length} tugas belum
            selesai. AI akan mempertimbangkan subtugas yang belum dijadwalkan
            dan belum dikerjakan.
          </p>

          <button
            type="button"
            onClick={handleGenerateSchedule}
            disabled={scheduleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            <CalendarClock size={17} />
            {scheduleLoading ? "Menyusun jadwal..." : "Buat Draft Jadwal"}
          </button>

          {scheduleError && (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {scheduleError}
            </p>
          )}

          {scheduleSaved && (
            <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
              Jadwal berhasil disimpan ke Planner.
            </p>
          )}
        </div>

        {scheduleDraft && (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="font-semibold text-slate-900">Preview Jadwal</h3>

            <p className="mt-1 text-xs text-slate-500">
              Periksa dan edit setiap jadwal sebelum menyetujuinya.
            </p>

            {scheduleDraft.conflicts.map((conflict, index) => (
              <p
                key={`conflict-${index}`}
                className="mt-2 rounded-lg bg-amber-50 p-2 text-sm text-amber-800"
              >
                {conflict}
              </p>
            ))}

            {scheduleDraft.notes.map((note, index) => (
              <p key={`note-${index}`} className="mt-2 text-xs text-slate-500">
                {note}
              </p>
            ))}

            {scheduleDraft.schedules.length === 0 && (
              <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                AI belum menemukan jadwal yang sesuai. Periksa waktu luang atau
                deadline tugasmu.
              </p>
            )}

            <div className="mt-4 space-y-4">
              {scheduleDraft.schedules.map((item, index) => (
                <div
                  key={`${item.taskId}-${item.subTaskId}-${index}`}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <p className="font-medium text-slate-800">{item.title}</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Estimasi {item.estimatedMinutes} menit
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    {item.rationale}
                  </p>

                  <div className="mt-3">
                    <label className="mb-1 block text-xs text-slate-500">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={item.date}
                      onChange={(event) =>
                        updateDraftItem(index, "date", event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs text-slate-500">
                        Mulai
                      </label>
                      <input
                        type="time"
                        value={item.startTime}
                        onChange={(event) =>
                          updateDraftItem(
                            index,
                            "startTime",
                            event.target.value,
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-slate-500">
                        Selesai
                      </label>
                      <input
                        type="time"
                        value={item.endTime}
                        onChange={(event) =>
                          updateDraftItem(index, "endTime", event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 p-2 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDraftItem(index)}
                    className="mt-3 flex items-center gap-2 text-xs text-red-600"
                  >
                    <Trash2 size={14} />
                    Hapus dari draft
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleApproveSchedule}
              disabled={scheduleSaved || scheduleDraft.schedules.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Check size={17} />
              Setujui dan Simpan ke Planner
            </button>
          </div>
        )}
      </section>

      <section className="mt-6 space-y-3">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`flex ${
              item.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                item.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {item.content}
            </div>
          </div>
        ))}

        {chatLoading && (
          <p className="text-sm text-slate-400">AI sedang berpikir...</p>
        )}
      </section>

      {generatedTask && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400">
                Tugas dari AI
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {generatedTask.title}
              </h2>
            </div>

            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              {generatedTask.priority}
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs text-slate-500">
            <p>
              Mata kuliah:{" "}
              <span className="font-medium text-slate-700">
                {generatedTask.course || "Belum ditentukan"}
              </span>
            </p>

            <p>
              Deadline:{" "}
              <span className="font-medium text-slate-700">
                {generatedTask.dueDate || "Belum ditentukan"}
              </span>
            </p>

            <p>
              Estimasi:{" "}
              <span className="font-medium text-slate-700">
                {generatedTask.estimatedMinutes} menit
              </span>
            </p>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-800">Subtask</p>

            <div className="mt-3 space-y-2">
              {generatedTask.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-md border border-slate-300 bg-white">
                    <span className="text-[10px] text-slate-400">
                      {subtask.id}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700">{subtask.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {subtask.estimatedMinutes} menit
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddTask}
            disabled={taskAdded}
            className={`mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
              taskAdded
                ? "bg-green-100 text-green-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {taskAdded ? (
              <>
                <Check size={17} />
                Tugas Berhasil Ditambahkan
              </>
            ) : (
              <>
                <Plus size={17} />
                Tambahkan ke Tugas
              </>
            )}
          </button>
        </section>
      )}

      <section className="mt-6">
        <p className="text-xs font-medium text-slate-400">Coba tanyakan</p>

        <div className="mt-3 space-y-2">
          {[
            "Aku punya banyak tugas, bantu prioritaskan.",
            "Pecah tugas makalah menjadi beberapa langkah.",
            "Bantu buat jadwal belajar hari ini.",
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setMessage(suggestion)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSend();
            }}
            placeholder="Ceritakan tugasmu..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || chatLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
