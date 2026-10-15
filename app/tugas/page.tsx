"use client";

import { useState } from "react";
import { useTaskStore } from "@/stores/task-store";
import { usePlannerStore } from "@/stores/planner-store";
import { Plus } from "lucide-react";

import TaskCard, { type Task } from "@/components/tasks/tasks-card";
import TaskProgress from "@/components/tasks/tasks-progress";
import AddTaskForm from "@/components/tasks/add-task-form";

export default function TugasPage() {
  const tasks = useTaskStore((state) => state.tasks);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [expectedOutput, setExpectedOutput] = useState("");

  const [priority, setPriority] = useState<Task["priority"]>("Sedang");

  const toggleTaskInStore = useTaskStore((state) => state.toggleTask);

  const toggleSubTaskInStore = useTaskStore((state) => state.toggleSubTask);

  const setSubTaskCompleted = useTaskStore(
    (state) => state.setSubTaskCompleted,
  );

  const setTaskCompleted = useTaskStore((state) => state.setTaskCompleted);

  const plannerItems = usePlannerStore((state) => state.plannerItems);

  const togglePlannerItem = usePlannerStore((state) => state.togglePlannerItem);

  function toggleTask(taskId: number) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) return;

    const nextCompleted = !task.completed;

    toggleTaskInStore(taskId);

    // Sinkronkan status semua jadwal yang terkait dengan tugas.
    plannerItems
      .filter((item) => item.taskId === taskId)
      .forEach((item) => {
        if (item.completed !== nextCompleted) {
          togglePlannerItem(item.id);
        }
      });

    // Sinkronkan status subtugas agar tetap konsisten.
    task.subtasks.forEach((subtask) => {
      setSubTaskCompleted(taskId, subtask.id, nextCompleted);
    });
  }

  function toggleSubTask(taskId: number, subTaskId: number) {
    const task = tasks.find((item) => item.id === taskId);
    const subtask = task?.subtasks.find((item) => item.id === subTaskId);

    if (!task || !subtask) return;

    const nextCompleted = !subtask.completed;

    toggleSubTaskInStore(taskId, subTaskId);

    // Sinkronkan semua jadwal untuk subtugas ini.
    plannerItems
      .filter((item) => item.taskId === taskId && item.subTaskId === subTaskId)
      .forEach((item) => {
        if (item.completed !== nextCompleted) {
          togglePlannerItem(item.id);
        }
      });

    // Jika subtugas yang dibuka kembali sebelumnya membuat
    // tugas induk selesai, tugas induk harus kembali belum selesai.
    if (!nextCompleted && task.completed) {
      setTaskCompleted(taskId, false);

      // Jadwal lain milik tugas yang dibuka kembali ikut dibatalkan status selesainya.
      plannerItems
        .filter(
          (item) =>
            item.taskId === taskId &&
            item.subTaskId !== subTaskId &&
            item.completed,
        )
        .forEach((item) => togglePlannerItem(item.id));
    }
  }

  const addTaskToStore = useTaskStore((state) => state.addTask);

  const addPlannerItem = usePlannerStore((state) => state.addPlannerItem);

  function addTaskToPlanner(
    task: Task,
    schedule: {
      date: string;
      startTime: string;
      endTime: string;
    },
  ) {
    addPlannerItem({
      id: Date.now(),
      taskId: task.id,
      subTaskId: null,
      title: task.title,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      completed: false,
    });
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
      subtasks: [],
    };

    addTaskToStore(newTask);

    setTitle("");
    setCourse("");
    setDueDate("");
    setEstimatedMinutes(60);
    setExpectedOutput("");
    setPriority("Sedang");
    setShowForm(false);
  }

  const completedTasks = tasks.filter((task) => task.completed).length;

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
            <TaskCard
              key={task.id}
              task={task}
              onToggle={toggleTask}
              onToggleSubTask={toggleSubTask}
              onAddToPlanner={addTaskToPlanner}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
