import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const taskSchema = {
  type: "OBJECT",
  properties: {
    type: { type: "STRING", enum: ["task", "general"] },
    title: { type: "STRING" },
    course: { type: "STRING" },
    dueDate: { type: "STRING" },
    estimatedMinutes: { type: "NUMBER" },
    expectedOutput: { type: "STRING" },
    priority: {
      type: "STRING",
      enum: ["Rendah", "Sedang", "Tinggi"],
    },
    subtasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          estimatedMinutes: { type: "NUMBER" },
        },
        required: ["title", "estimatedMinutes"],
      },
    },
  },
  required: [
    "type",
    "title",
    "course",
    "dueDate",
    "estimatedMinutes",
    "expectedOutput",
    "priority",
    "subtasks",
  ],
};

const scheduleSchema = {
  type: "OBJECT",
  properties: {
    type: { type: "STRING", enum: ["schedule"] },
    schedules: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          taskId: { type: "NUMBER" },
          subTaskId: { type: "NUMBER" },
          title: { type: "STRING" },
          date: { type: "STRING" },
          startTime: { type: "STRING" },
          endTime: { type: "STRING" },
          estimatedMinutes: { type: "NUMBER" },
          rationale: { type: "STRING" },
        },
        required: [
          "taskId",
          "subTaskId",
          "title",
          "date",
          "startTime",
          "endTime",
          "estimatedMinutes",
          "rationale",
        ],
      },
    },
    conflicts: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
    notes: {
      type: "ARRAY",
      items: { type: "STRING" },
    },
  },
  required: ["type", "schedules", "conflicts", "notes"],
};

const taskInstructions = `
Kamu adalah MabaFlow Assistant, AI untuk membantu mahasiswa
mengatur tugas dan waktu.

Aturan:
- Gunakan type task untuk membuat struktur tugas.
- Gunakan type general untuk percakapan biasa.
- Jangan mengarang deadline yang tidak diberikan.
- Jika mata kuliah tidak diketahui, gunakan string kosong.
- Prioritas hanya Rendah, Sedang, atau Tinggi.
- Estimasi durasi menggunakan menit.
- Pecah tugas besar menjadi subtugas yang realistis.
`;

const scheduleInstructions = `
Kamu adalah MabaFlow AI Planner.

Buat draft jadwal belajar berdasarkan data tugas, preferensi,
waktu luang, dan jadwal yang sudah ada.

Aturan wajib:
- Gunakan taskId dan subTaskId yang tersedia pada data.
- Jadwalkan hanya subtugas yang belum selesai.
- Gunakan tanggal YYYY-MM-DD dan waktu HH:mm.
- Hormati estimasi durasi dan preferensi belajar.
- Jadwalkan hanya dalam waktu luang yang diberikan.
- Jangan bertabrakan dengan jadwal yang sudah ada.
- Jangan mengarang waktu luang atau deadline.
- Jangan mengubah jadwal lama.
- Jangan memaksakan jadwal jika waktu tidak mencukupi.
- Jelaskan masalah melalui conflicts dan notes.
- Jika tidak ada jadwal yang layak, gunakan schedules kosong.
- Hasil hanya berupa draft, belum disimpan ke Planner.
`;

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum dikonfigurasi." },
        { status: 500 },
      );
    }

    const body = await request.json();

    // AI PLANNER
    if (body.action === "schedule") {
      if (!Array.isArray(body.tasks) || body.tasks.length === 0) {
        return NextResponse.json(
          { error: "Tambahkan tugas sebelum membuat jadwal." },
          { status: 400 },
        );
      }

      if (!Array.isArray(body.availability) || body.availability.length === 0) {
        return NextResponse.json(
          { error: "Tentukan waktu luang terlebih dahulu." },
          { status: 400 },
        );
      }

      const scheduleResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: JSON.stringify({
          request:
            typeof body.message === "string"
              ? body.message
              : "Buat jadwal belajar yang realistis berdasarkan data tugas dan waktu luang yang tersedia.",
          tasks: body.tasks,
          preferences: body.preferences ?? {},
          availability: body.availability,
          existingSchedules: body.existingSchedules ?? [],
        }),
        config: {
          systemInstruction: scheduleInstructions,
          responseMimeType: "application/json",
          responseSchema: scheduleSchema,
        },
      });

      if (!scheduleResponse.text) {
        return NextResponse.json(
          { error: "Gemini tidak memberikan respons." },
          { status: 502 },
        );
      }

      return NextResponse.json({
        result: scheduleResponse.text,
      });
    }

    // CHAT AI / PEMBUATAN TUGAS
    const message = body.message;

    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message tidak boleh kosong." },
        { status: 400 },
      );
    }

    const taskResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: message,
      config: {
        systemInstruction: taskInstructions,
        responseMimeType: "application/json",
        responseSchema: taskSchema,
      },
    });

    if (!taskResponse.text) {
      return NextResponse.json(
        { error: "Gemini tidak memberikan respons." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      result: taskResponse.text,
    });
  } catch (error) {
    console.error("MabaFlow Gemini Error:", error);

    return NextResponse.json(
      {
        error: "Terjadi kesalahan saat menghubungi Gemini AI.",
      },
      { status: 500 },
    );
  }
}
