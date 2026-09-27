"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import TaskCard, { type Task } from "@/components/tasks/tasks-card";
import TaskProgress from "@/components/tasks/tasks-progress";
import AddTaskForm from "@/components/tasks/add-task-form";

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Membaca materi Sistem Informasi",
    course: "Sistem Informasi",
    dueDate: "2026-09-29",
    estimatedMinutes: 60,
    expectedOutput: "Ringkasan materi",
    priority: "Sedang",
    completed: false,
  },
  {
    id: 2,
    title: "Mengerjakan tugas Algoritma",
    course: "Algoritma",
    dueDate: "2026-09-30",
    estimatedMinutes: 120,
    expectedOutput: "File tugas Algoritma",
    priority: "Tinggi",
    completed: false,
  },
  {
    id: 3,
    title: "Review materi minggu ini",
    course: "Pemrograman Web",
    dueDate: "2026-10-03",
    estimatedMinutes: 45,
    expectedOutput: "Catatan review",
    priority: "Rendah",
    completed: true,
  },
];

export default function TugasPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [expectedOutput, setExpectedOutput] = useState("");

  const [priority, setPriority] = useState<Task["priority"]>("Sedang");

  function toggleTask(id: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    );
  }

  function addTask() {
    if (!title.trim()) {
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      title: title.trim(),
      course: course.trim() || "Umum",
      dueDate: dueDate || "Belum ditentukan",
      estimatedMinutes,
      expectedOutput: expectedOutput.trim() || "Belum ditentukan",
      priority,
      completed: false,
    };

    setTasks((currentTasks) => [...currentTasks, newTask]);

    setTitle("");
    setCourse("");
    setDueDate("");
    setEstimatedMinutes(60);
    setExpectedOutput("");
    setPriority("Sedang");
    setShowForm(false);
  }

  const completedTasks = tasks.filter((task) => task.completed).length;

  // const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <main className="min-h-screen p-6">
      {/* Header */}
      <section>
        <p className="text-sm text-slate-500">Task Management</p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">Tugas</h1>

        <p className="mt-2 text-sm text-slate-500">
          Kelola tugas, deadline, dan prioritasmu.
        </p>
      </section>

      {/* Progress */}
      <TaskProgress completed={completedTasks} total={tasks.length} />

      {/* Tambah Tugas */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        <Plus size={18} />
        Tambah Tugas
      </button>

      {/* Form Tambah Tugas */}
      <AddTaskForm
        showForm={showForm}
        setShowForm={setShowForm}
        title={title}
        setTitle={setTitle}
        course={course}
        setCourse={setCourse}
        dueDate={dueDate}
        setDueDate={setDueDate}
        estimatedMinutes={estimatedMinutes}
        setEstimatedMinutes={setEstimatedMinutes}
        expectedOutput={expectedOutput}
        setExpectedOutput={setExpectedOutput}
        priority={priority}
        setPriority={setPriority}
        onAddTask={addTask}
      />

      {/* Semua Tugas */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Semua Tugas</h2>

          <span className="text-sm text-slate-400">{tasks.length} tugas</span>
        </div>

        {/* tasks.map */}
        <div className="mt-3 space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} />
          ))}
        </div>
      </section>
    </main>
  );
}
