"use client";

import { useState } from "react";
import { useTaskStore } from "@/stores/task-store";
import { usePlannerStore } from "@/stores/planner-store";
import { Plus, CheckCircle2, ListTodo } from "lucide-react";

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

    plannerItems
      .filter((item) => item.taskId === taskId)
      .forEach((item) => {
        if (item.completed !== nextCompleted) {
          togglePlannerItem(item.id);
        }
      });

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

    plannerItems
      .filter((item) => item.taskId === taskId && item.subTaskId === subTaskId)
      .forEach((item) => {
        if (item.completed !== nextCompleted) {
          togglePlannerItem(item.id);
        }
      });

    if (!nextCompleted && task.completed) {
      setTaskCompleted(taskId, false);

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
    if (!title.trim()) return;

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
    <main className="min-h-screen space-y-6 bg-[#F3F7F0] px-4 py-5 text-[#183D32]">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DCEBDD] text-[#17664E]">
            <ListTodo size={20} />
          </div>
          <p className="text-sm font-medium text-[#668073]">Task Management</p>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">Tugas</h1>

        <p className="mt-2 text-sm leading-6 text-[#668073]">
          Kelola tugas, deadline, dan prioritasmu dalam satu tempat.
        </p>
      </header>

      {/* Progress */}
      <section className="overflow-hidden rounded-2xl border border-[#E2EAE0] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 size={18} className="text-[#278568]" />
          <h2 className="font-semibold">Ringkasan progres</h2>
        </div>

        <TaskProgress completed={completedTasks} total={tasks.length} />
      </section>

      {/* Tambah Tugas */}
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#17664E] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12543F] active:scale-[0.99]"
      >
        <Plus size={19} />
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
      <section className="pb-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#82978A]">
              Daftar aktivitas
            </p>
            <h2 className="mt-1 text-lg font-bold">Semua Tugas</h2>
          </div>

          <span className="rounded-full bg-[#E1EDE0] px-3 py-1.5 text-xs font-semibold text-[#17664E]">
            {tasks.length} tugas
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onToggleSubTask={toggleSubTask}
                onAddToPlanner={addTaskToPlanner}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#CCDCCB] bg-white/70 px-5 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3E8] text-[#17664E]">
                <ListTodo size={23} />
              </div>

              <h3 className="mt-3 text-sm font-semibold">Belum ada tugas</h3>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#7A8D81]">
                Tambahkan tugas pertamamu untuk mulai menyusun prioritas dan
                mengatur deadline.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
