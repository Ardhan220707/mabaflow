"use client";

import { useState } from "react";
import { Check, Plus, Send } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";

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

  const addTask = useTaskStore((state) => state.addTask);

  const getAiResponse = (text: string) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes("makalah") || lowerText.includes("tugas besar")) {
      const newTask: AiTask = {
        title: "Makalah Sistem Informasi",
        course: "Sistem Informasi",
        dueDate: "2026-10-20",
        estimatedMinutes: 120,
        expectedOutput: "Makalah Sistem Informasi",
        priority: "Tinggi",
        subtasks: [
          {
            id: 1,
            title: "Cari referensi",
            estimatedMinutes: 25,
            completed: false,
          },
          {
            id: 2,
            title: "Buat outline makalah",
            estimatedMinutes: 20,
            completed: false,
          },
          {
            id: 3,
            title: "Tulis isi makalah",
            estimatedMinutes: 55,
            completed: false,
          },
          {
            id: 4,
            title: "Review dan perbaiki makalah",
            estimatedMinutes: 20,
            completed: false,
          },
        ],
      };

      setGeneratedTask(newTask);

      return "Aku sudah mencoba memecah tugas tersebut menjadi beberapa langkah. Kalau sudah sesuai, kamu bisa menambahkannya ke daftar tugas.";
    }

    if (lowerText.includes("prioritas") || lowerText.includes("banyak tugas")) {
      return "Bisa. Untuk menentukan prioritas, aku akan melihat deadline, tingkat kepentingan, dan estimasi waktu pengerjaan.";
    }

    if (lowerText.includes("jadwal") || lowerText.includes("belajar")) {
      return "Bisa. Berikan daftar tugas dan waktu luangmu. Nanti kita bisa menyusun jadwal belajar yang realistis.";
    }

    if (lowerText.includes("pecah") || lowerText.includes("langkah")) {
      return "Bisa. Berikan nama tugasnya dan aku akan membantu memecahnya menjadi beberapa langkah kecil.";
    }

    return "Aku mengerti. Ceritakan lebih detail tentang tugas atau aktivitasmu, lalu aku akan bantu menyusunnya menjadi rencana yang lebih jelas.";
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    const response = getAiResponse(trimmedMessage);

    const assistantMessage: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: response,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);

    setMessage("");
    setTaskAdded(false);
  };

  const handleAddTask = () => {
    if (!generatedTask) return;

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

  return (
    <main className="min-h-screen p-6 pb-28">
      {/* Header */}
      <section>
        <p className="text-sm text-slate-500">MabaFlow Assistant</p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">AI Assistant</h1>

        <p className="mt-2 text-sm text-slate-500">
          Ceritakan tugas atau masalahmu. Aku bantu mengaturnya.
        </p>
      </section>

      {/* Chat */}
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
      </section>

      {/* Generated Task */}
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
                {generatedTask.course}
              </span>
            </p>

            <p>
              Deadline:{" "}
              <span className="font-medium text-slate-700">
                {generatedTask.dueDate}
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

          {/* Add Task Button */}
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

      {/* Quick Actions */}
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

      {/* Input */}
      <section className="mt-6">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Ceritakan tugasmu..."
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={17} />
          </button>
        </div>
      </section>
    </main>
  );
}
