"use client";

import { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  MessageCircle,
  ClipboardList,
  CalendarClock,
  Clock3,
  Plus,
  LoaderCircle,
  AlertCircle,
  Check,
  Trash2,
} from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { usePlannerStore } from "@/stores/planner-store";

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

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const cardStyle = "rounded-2xl border border-[#E2EAE0] bg-white p-4 shadow-sm";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#17664E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12513E] disabled:cursor-not-allowed disabled:opacity-50";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "planner">("chat");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Halo! Aku siap bantu kamu mengatur tugas, menentukan prioritas, dan menyusun rencana belajar yang lebih realistis. Mau mulai dari mana?",
    },
  ]);

  const [message, setMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");

  const [generatedTask, setGeneratedTask] = useState<AiTask | null>(null);
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState("");
  const [taskSaved, setTaskSaved] = useState(false);

  const [plannerDate, setPlannerDate] = useState(today());
  const [freeStart, setFreeStart] = useState("08:00");
  const [freeEnd, setFreeEnd] = useState("21:00");
  const [preferredStart, setPreferredStart] = useState("09:00");
  const [preferredEnd, setPreferredEnd] = useState("17:00");
  const [sessionMinutes, setSessionMinutes] = useState(50);
  const [breakMinutes, setBreakMinutes] = useState(10);

  const [scheduleDraft, setScheduleDraft] = useState<ScheduleDraft[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleNotes, setScheduleNotes] = useState<string[]>([]);
  const [scheduleSaved, setScheduleSaved] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const addTask = useTaskStore((state) => state.addTask);

  const plannerItems = usePlannerStore((state) => state.plannerItems);
  const addPlannerItem = usePlannerStore((state) => state.addPlannerItem);

  const unfinishedTasks = tasks.filter((task) => !task.completed);

  async function callAI(payload: Record<string, unknown>) {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof data.error === "string"
          ? data.error
          : "AI belum bisa memproses permintaan. Coba lagi.",
      );
    }

    return data;
  }

  async function handleSend() {
    const text = message.trim();

    if (!text || chatLoading) return;

    setChatError("");
    setMessage("");

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((previous) => [...previous, userMessage]);
    setChatLoading(true);

    try {
      const data = await callAI({
        type: "chat",
        message: text,
      });

      const reply =
        data.reply ??
        data.message ??
        data.response ??
        data.expectedOutput ??
        data.title;

      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            typeof reply === "string"
              ? reply
              : "Permintaan selesai diproses. Coba jelaskan lagi jika kamu membutuhkan hasil yang lebih spesifik.",
        },
      ]);
    } catch (error) {
      setChatError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menghubungi AI.",
      );
    } finally {
      setChatLoading(false);
    }
  }

  async function handleGenerateTask() {
    const prompt = message.trim();

    if (!prompt || taskLoading) return;

    setTaskError("");
    setTaskSaved(false);
    setTaskLoading(true);

    try {
      const data = await callAI({
        type: "task",
        prompt,
        message: prompt,
      });

      const rawTask = data.task ?? data;

      if (!rawTask.title || !Array.isArray(rawTask.subtasks)) {
        throw new Error(
          "AI belum menghasilkan format tugas yang lengkap. Coba jelaskan tugas dan deadline dengan lebih spesifik.",
        );
      }

      const subtasks = rawTask.subtasks.map(
        (
          subtask: {
            id?: number;
            title: string;
            estimatedMinutes?: number;
            completed?: boolean;
          },
          index: number,
        ) => ({
          id: subtask.id ?? Date.now() + index,
          title: subtask.title,
          estimatedMinutes: Math.max(5, Number(subtask.estimatedMinutes) || 30),
          completed: Boolean(subtask.completed),
        }),
      );

      setGeneratedTask({
        title: rawTask.title,
        course: rawTask.course || "",
        dueDate: rawTask.dueDate || today(),
        estimatedMinutes: Math.max(
          5,
          Number(rawTask.estimatedMinutes) ||
            subtasks.reduce(
              (total: number, item: { estimatedMinutes: number }) =>
                total + item.estimatedMinutes,
              0,
            ),
        ),
        expectedOutput: rawTask.expectedOutput || "",
        priority: ["Rendah", "Sedang", "Tinggi"].includes(rawTask.priority)
          ? rawTask.priority
          : "Sedang",
        subtasks,
      });

      setMessage("");
    } catch (error) {
      setTaskError(
        error instanceof Error ? error.message : "Gagal membuat tugas.",
      );
    } finally {
      setTaskLoading(false);
    }
  }

  function handleAddTask() {
    if (!generatedTask || taskSaved) return;

    addTask({
      id: Date.now(),
      title: generatedTask.title,
      course: generatedTask.course,
      dueDate: generatedTask.dueDate,
      estimatedMinutes: generatedTask.estimatedMinutes,
      expectedOutput: generatedTask.expectedOutput,
      priority: generatedTask.priority,
      subtasks: generatedTask.subtasks,
      completed: false,
    });

    setTaskSaved(true);
    setGeneratedTask(null);
    setMessage("");
  }

  function updateSchedule(
    index: number,
    field: keyof ScheduleDraft,
    value: string | number,
  ) {
    setScheduleDraft((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
    setScheduleSaved(false);
    setScheduleError("");
  }

  function removeSchedule(index: number) {
    setScheduleDraft((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index),
    );
    setScheduleSaved(false);
  }

  async function handleGenerateSchedule() {
    setScheduleError("");
    setScheduleNotes([]);
    setScheduleDraft([]);
    setScheduleSaved(false);

    if (!plannerDate) {
      setScheduleError("Pilih tanggal terlebih dahulu.");
      return;
    }

    if (freeStart >= freeEnd) {
      setScheduleError("Jam selesai harus setelah jam mulai.");
      return;
    }

    if (preferredStart >= preferredEnd) {
      setScheduleError("Jam belajar selesai harus setelah jam mulai.");
      return;
    }

    if (unfinishedTasks.length === 0) {
      setScheduleError(
        "Belum ada tugas yang belum selesai. Tambahkan tugas terlebih dahulu.",
      );
      return;
    }

    setScheduleLoading(true);

    try {
      const data = await callAI({
        action: "schedule",
        message: "Susun jadwal belajar yang realistis untuk tugas-tugas ini.",
        tasks: unfinishedTasks,
        availability: [
          {
            date: plannerDate,
            startTime: freeStart,
            endTime: freeEnd,
          },
        ],
        preferences: {
          preferredStart,
          preferredEnd,
          sessionMinutes,
          breakMinutes,
        },
        existingSchedules: plannerItems,
      });

      const result =
        typeof data.result === "string" ? JSON.parse(data.result) : data.result;

      const schedules = result?.schedules;

      if (!Array.isArray(schedules) || schedules.length === 0) {
        setScheduleNotes([
          ...(Array.isArray(result?.notes) ? result.notes : []),
          ...(Array.isArray(result?.conflicts) ? result.conflicts : []),
        ]);

        throw new Error(
          "AI belum menghasilkan jadwal. Coba periksa waktu luang dan tugasmu.",
        );
      }

      setScheduleDraft(
        schedules.map((item: ScheduleDraft, index: number) => ({
          ...item,
          taskId: Number(item.taskId),
          subTaskId: Number(item.subTaskId),
          date: item.date || plannerDate,
          estimatedMinutes: Math.max(5, Number(item.estimatedMinutes) || 30),
          startTime: item.startTime || "09:00",
          endTime: item.endTime || "09:30",
          rationale: item.rationale || "",
          title: item.title || `Sesi belajar ${index + 1}`,
        })),
      );

      setScheduleNotes([
        ...(Array.isArray(result.notes) ? result.notes : []),
        ...(Array.isArray(result.conflicts) ? result.conflicts : []),
      ]);
    } catch (error) {
      setScheduleError(
        error instanceof Error ? error.message : "Gagal membuat jadwal.",
      );
    } finally {
      setScheduleLoading(false);
    }
  }

  function handleApproveSchedule() {
    if (scheduleSaved || scheduleDraft.length === 0) return;

    setScheduleError("");

    const sorted = [...scheduleDraft].sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime),
    );

    for (const item of sorted) {
      if (
        !item.title.trim() ||
        !item.date ||
        !item.startTime ||
        !item.endTime ||
        item.startTime >= item.endTime
      ) {
        setScheduleError(
          "Periksa kembali judul, tanggal, dan jam setiap sesi. Jam selesai harus setelah jam mulai.",
        );
        return;
      }

      if (
        item.date === plannerDate &&
        (item.startTime < freeStart || item.endTime > freeEnd)
      ) {
        setScheduleError(
          "Ada sesi yang berada di luar waktu luang yang kamu pilih.",
        );
        return;
      }
    }

    for (let index = 1; index < sorted.length; index++) {
      const previous = sorted[index - 1];
      const current = sorted[index];

      if (
        previous.date === current.date &&
        current.startTime < previous.endTime
      ) {
        setScheduleError(
          "Ada sesi yang waktunya bertabrakan. Edit jamnya sebelum menyimpan.",
        );
        return;
      }
    }

    const existing = plannerItems as unknown as {
      date?: string;
      startTime?: string;
      endTime?: string;
      start?: string;
      end?: string;
    }[];

    for (const item of sorted) {
      const conflict = existing.some((existingItem) => {
        const existingStart = existingItem.startTime ?? existingItem.start;
        const existingEnd = existingItem.endTime ?? existingItem.end;

        return (
          existingItem.date === item.date &&
          typeof existingStart === "string" &&
          typeof existingEnd === "string" &&
          item.startTime < existingEnd &&
          item.endTime > existingStart
        );
      });

      if (conflict) {
        setScheduleError(
          "Jadwal bertabrakan dengan agenda yang sudah ada di Planner. Ubah waktunya sebelum menyimpan.",
        );
        return;
      }
    }

    try {
      sorted.forEach((item) => {
        addPlannerItem({
          id: Date.now() + Math.floor(Math.random() * 100000),
          title: item.title,
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          completed: false,
        } as Parameters<typeof addPlannerItem>[0]);
      });

      setScheduleSaved(true);
    } catch {
      setScheduleError(
        "Jadwal belum berhasil disimpan. Periksa format data Planner.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#F3F7F0] px-4 pb-28 pt-6 text-[#183D32]">
      <div className="mx-auto max-w-md space-y-5">
        <header className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DCEBDD] text-[#17664E]">
            <Bot size={27} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#82978A]">
              Asisten produktivitasmu
            </p>
            <h1 className="text-2xl font-bold tracking-tight">AI Assistant</h1>
          </div>

          <span className="rounded-full bg-[#DCEBDD] px-3 py-1 text-xs font-semibold text-[#17664E]">
            <Sparkles size={12} className="mr-1 inline" />
            AI
          </span>
        </header>

        <section className="rounded-2xl border border-[#E2EAE0] bg-white p-1.5 shadow-sm">
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === "chat"
                  ? "bg-[#17664E] text-white"
                  : "text-[#82978A] hover:bg-[#F3F7F0]"
              }`}
            >
              <MessageCircle size={17} />
              Chat AI
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("planner")}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                activeTab === "planner"
                  ? "bg-[#17664E] text-white"
                  : "text-[#82978A] hover:bg-[#F3F7F0]"
              }`}
            >
              <CalendarClock size={17} />
              AI Planner
            </button>
          </div>
        </section>

        {activeTab === "chat" ? (
          <>
            <section className="rounded-2xl bg-[#DCEBDD] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-[#17664E]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="font-bold">Teman belajar kamu</h2>
                  <p className="mt-1 text-sm leading-6 text-[#466B59]">
                    Ceritakan tugasmu, minta saran prioritas, atau ubah tugas
                    besar menjadi langkah kecil.
                  </p>
                </div>
              </div>
            </section>

            <section className={`${cardStyle} space-y-4`}>
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Percakapan</h2>
                <button
                  type="button"
                  onClick={() =>
                    setMessages([
                      {
                        id: Date.now(),
                        role: "assistant",
                        content:
                          "Halo! Ada yang bisa aku bantu rencanakan hari ini?",
                      },
                    ])
                  }
                  className="text-xs font-semibold text-[#17664E] hover:underline"
                >
                  Chat baru
                </button>
              </div>

              <div className="max-h-[420px] space-y-3 overflow-y-auto">
                {messages.map((item) => (
                  <div
                    key={item.id}
                    className={`flex ${
                      item.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        item.role === "user"
                          ? "rounded-br-md bg-[#17664E] text-white"
                          : "rounded-bl-md bg-[#F3F7F0] text-[#183D32]"
                      }`}
                    >
                      {item.content}
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex items-center gap-2 text-sm text-[#82978A]">
                    <LoaderCircle size={17} className="animate-spin" />
                    AI sedang berpikir...
                  </div>
                )}
              </div>

              {chatError && (
                <p
                  role="alert"
                  className="rounded-xl bg-[#FFF3F0] p-3 text-sm text-[#943F35]"
                >
                  {chatError}
                </p>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSend();
                }}
                className="flex items-end gap-2 border-t border-[#E2EAE0] pt-3"
              >
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  placeholder="Tulis pertanyaanmu..."
                  rows={2}
                  className="min-w-0 flex-1 resize-none rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm text-[#183D32] outline-none placeholder:text-[#82978A] focus:border-[#17664E] focus:ring-2 focus:ring-[#DCEBDD]"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || chatLoading}
                  aria-label="Kirim pesan"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#17664E] text-white transition hover:bg-[#12513E] disabled:opacity-50"
                >
                  {chatLoading ? (
                    <LoaderCircle size={19} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </section>

            <section className={cardStyle}>
              <h3 className="mb-3 text-sm font-bold">Coba tanyakan ini</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Bantu aku menentukan prioritas tugas",
                  "Bagaimana cara mulai belajar?",
                  "Buat strategi belajar yang realistis",
                ].map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => setMessage(suggestion)}
                    className="rounded-full border border-[#E2EAE0] px-3 py-2 text-left text-xs text-[#466B59] transition hover:border-[#17664E] hover:bg-[#F3F7F0]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </section>

            <section className={cardStyle}>
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList size={19} className="text-[#17664E]" />
                <h2 className="font-bold">Ubah ide menjadi tugas</h2>
              </div>
              <p className="mb-3 text-sm leading-6 text-[#82978A]">
                Tulis instruksi tugas beserta mata kuliah dan deadline jika
                tersedia. AI akan mencoba menyusun detail serta subtask-nya.
              </p>

              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Contoh: Aku harus membuat laporan praktikum sebelum Jumat..."
                rows={3}
                className="w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm text-[#183D32] outline-none placeholder:text-[#82978A] focus:border-[#17664E] focus:ring-2 focus:ring-[#DCEBDD]"
              />

              <button
                type="button"
                onClick={() => void handleGenerateTask()}
                disabled={!message.trim() || taskLoading}
                className={`${primaryButton} mt-3 w-full`}
              >
                {taskLoading ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Sparkles size={17} />
                )}
                Buat tugas dengan AI
              </button>

              {taskError && (
                <p
                  role="alert"
                  className="mt-3 rounded-xl bg-[#FFF3F0] p-3 text-sm text-[#943F35]"
                >
                  {taskError}
                </p>
              )}

              {taskSaved && (
                <p className="mt-3 rounded-xl bg-[#DCEBDD] p-3 text-sm text-[#17664E]">
                  <Check size={16} className="mr-1 inline" />
                  Tugas berhasil ditambahkan.
                </p>
              )}

              {generatedTask && (
                <div className="mt-4 space-y-3 rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] p-4">
                  <div>
                    <p className="text-xs font-medium text-[#82978A]">
                      HASIL AI
                    </p>
                    <h3 className="mt-1 font-bold">{generatedTask.title}</h3>
                    <p className="mt-1 text-sm text-[#82978A]">
                      {generatedTask.course || "Mata kuliah belum diisi"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[#DCEBDD] px-3 py-1.5 text-[#17664E]">
                      {generatedTask.priority}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1.5 text-[#466B59]">
                      {generatedTask.estimatedMinutes} menit
                    </span>
                    <span className="rounded-full bg-white px-3 py-1.5 text-[#466B59]">
                      Deadline: {generatedTask.dueDate}
                    </span>
                  </div>

                  {generatedTask.expectedOutput && (
                    <p className="text-sm leading-6 text-[#466B59]">
                      {generatedTask.expectedOutput}
                    </p>
                  )}

                  <div>
                    <h4 className="mb-2 text-sm font-semibold">
                      Langkah pengerjaan
                    </h4>
                    <ul className="space-y-2">
                      {generatedTask.subtasks.map((subtask) => (
                        <li
                          key={subtask.id}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span>{subtask.title}</span>
                          <span className="shrink-0 text-xs text-[#82978A]">
                            {subtask.estimatedMinutes} mnt
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTask}
                    className={`${primaryButton} w-full`}
                  >
                    <Plus size={17} />
                    Tambahkan ke Tugas
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            <section className="rounded-2xl bg-[#DCEBDD] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 text-[#17664E]">
                  <CalendarClock size={21} />
                </div>
                <div>
                  <h2 className="font-bold">Rencanakan waktu belajarmu</h2>
                  <p className="mt-1 text-sm leading-6 text-[#466B59]">
                    AI menyusun sesi belajar berdasarkan tugas dan waktu yang
                    kamu sediakan. Kamu tetap bisa mengedit jadwal sebelum
                    menyimpannya.
                  </p>
                </div>
              </div>
            </section>

            <section className={`${cardStyle} space-y-4`}>
              <h2 className="font-bold">Preferensi jadwal</h2>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Tanggal rencana
                </label>
                <input
                  type="date"
                  value={plannerDate}
                  min={today()}
                  onChange={(event) => setPlannerDate(event.target.value)}
                  className="w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm outline-none focus:border-[#17664E]"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Waktu luang</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-[#82978A]">
                    Mulai
                    <input
                      type="time"
                      value={freeStart}
                      onChange={(event) => setFreeStart(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm text-[#183D32]"
                    />
                  </label>
                  <label className="text-xs text-[#82978A]">
                    Selesai
                    <input
                      type="time"
                      value={freeEnd}
                      onChange={(event) => setFreeEnd(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm text-[#183D32]"
                    />
                  </label>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Jam belajar pilihan</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-xs text-[#82978A]">
                    Mulai
                    <input
                      type="time"
                      value={preferredStart}
                      onChange={(event) =>
                        setPreferredStart(event.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm text-[#183D32]"
                    />
                  </label>
                  <label className="text-xs text-[#82978A]">
                    Selesai
                    <input
                      type="time"
                      value={preferredEnd}
                      onChange={(event) => setPreferredEnd(event.target.value)}
                      className="mt-1 w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm text-[#183D32]"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">
                  <span className="mb-2 block font-medium">Durasi sesi</span>
                  <select
                    value={sessionMinutes}
                    onChange={(event) =>
                      setSessionMinutes(Number(event.target.value))
                    }
                    className="w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm"
                  >
                    <option value={25}>25 menit</option>
                    <option value={45}>45 menit</option>
                    <option value={50}>50 menit</option>
                    <option value={60}>60 menit</option>
                    <option value={90}>90 menit</option>
                  </select>
                </label>

                <label className="text-sm">
                  <span className="mb-2 block font-medium">
                    Waktu istirahat
                  </span>
                  <select
                    value={breakMinutes}
                    onChange={(event) =>
                      setBreakMinutes(Number(event.target.value))
                    }
                    className="w-full rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] px-3 py-3 text-sm"
                  >
                    <option value={5}>5 menit</option>
                    <option value={10}>10 menit</option>
                    <option value={15}>15 menit</option>
                    <option value={20}>20 menit</option>
                  </select>
                </label>
              </div>

              <div className="rounded-xl bg-[#F3F7F0] p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#466B59]">
                    Tugas yang belum selesai
                  </span>
                  <span className="font-bold">{unfinishedTasks.length}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-[#466B59]">
                    Agenda di Planner
                  </span>
                  <span className="font-bold">{plannerItems.length}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleGenerateSchedule()}
                disabled={scheduleLoading}
                className={`${primaryButton} w-full`}
              >
                {scheduleLoading ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Sparkles size={17} />
                )}
                Buat jadwal dengan AI
              </button>

              {scheduleError && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#F0D0CA] bg-[#FFF3F0] p-3 text-sm leading-6 text-[#943F35]"
                >
                  <AlertCircle size={17} className="mr-1 inline" />
                  {scheduleError}
                </div>
              )}
            </section>

            {scheduleNotes.length > 0 && (
              <section className={cardStyle}>
                <h3 className="mb-2 font-bold">Catatan AI</h3>
                <ul className="space-y-2 text-sm leading-6 text-[#466B59]">
                  {scheduleNotes.map((note, index) => (
                    <li key={`${index}-${note}`}>• {note}</li>
                  ))}
                </ul>
              </section>
            )}

            {scheduleDraft.length > 0 && (
              <section className={`${cardStyle} space-y-4`}>
                <div>
                  <h2 className="font-bold">Pratinjau jadwal</h2>
                  <p className="mt-1 text-sm text-[#82978A]">
                    Periksa dan edit jadwal sebelum memasukkannya ke Planner.
                  </p>
                </div>

                <div className="space-y-3">
                  {scheduleDraft.map((item, index) => (
                    <div
                      key={`${item.taskId}-${item.subTaskId}-${index}`}
                      className="rounded-xl border border-[#E2EAE0] bg-[#F9FBF8] p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <input
                            value={item.title}
                            onChange={(event) =>
                              updateSchedule(index, "title", event.target.value)
                            }
                            aria-label={`Judul sesi ${index + 1}`}
                            className="w-full rounded-lg border border-[#E2EAE0] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#17664E]"
                          />
                          <p className="mt-2 text-xs text-[#82978A]">
                            {item.rationale}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSchedule(index)}
                          aria-label={`Hapus sesi ${index + 1}`}
                          className="rounded-lg p-2 text-[#82978A] transition hover:bg-[#F5D1CC] hover:text-[#943F35]"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>

                      <label className="mt-3 block text-xs text-[#82978A]">
                        Tanggal
                        <input
                          type="date"
                          value={item.date}
                          onChange={(event) =>
                            updateSchedule(index, "date", event.target.value)
                          }
                          className="mt-1 w-full rounded-lg border border-[#E2EAE0] bg-white px-3 py-2 text-sm text-[#183D32]"
                        />
                      </label>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <label className="text-xs text-[#82978A]">
                          Mulai
                          <input
                            type="time"
                            value={item.startTime}
                            onChange={(event) =>
                              updateSchedule(
                                index,
                                "startTime",
                                event.target.value,
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-[#E2EAE0] bg-white px-3 py-2 text-sm text-[#183D32]"
                          />
                        </label>
                        <label className="text-xs text-[#82978A]">
                          Selesai
                          <input
                            type="time"
                            value={item.endTime}
                            onChange={(event) =>
                              updateSchedule(
                                index,
                                "endTime",
                                event.target.value,
                              )
                            }
                            className="mt-1 w-full rounded-lg border border-[#E2EAE0] bg-white px-3 py-2 text-sm text-[#183D32]"
                          />
                        </label>
                      </div>

                      <p className="mt-2 flex items-center gap-1 text-xs text-[#82978A]">
                        <Clock3 size={13} />
                        Estimasi {item.estimatedMinutes} menit
                      </p>
                    </div>
                  ))}
                </div>

                {scheduleError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-[#FFF3F0] p-3 text-sm text-[#943F35]"
                  >
                    {scheduleError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleApproveSchedule}
                  disabled={scheduleSaved || scheduleDraft.length === 0}
                  className={`${primaryButton} w-full`}
                >
                  <Check size={17} />
                  {scheduleSaved
                    ? "Jadwal berhasil disimpan"
                    : "Simpan ke Planner"}
                </button>

                {scheduleSaved && (
                  <p className="text-center text-sm text-[#17664E]">
                    Jadwal sudah ditambahkan ke Planner.
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
