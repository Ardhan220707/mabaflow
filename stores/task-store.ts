import { create } from "zustand";
import type { Task } from "@/components/tasks/tasks-card";

type TaskStore = {
  tasks: Task[];

  setTasks: (tasks: Task[]) => void;

  toggleTask: (id: number) => void;

  toggleSubTask: (taskId: number, subTaskId: number) => void;

  setSubTaskCompleted: (
    taskId: number,
    subTaskId: number,
    completed: boolean,
  ) => void;

  setTaskCompleted: (taskId: number, completed: boolean) => void;

  addTask: (task: Task) => void;
};

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
    subtasks: [
      {
        id: 1,
        title: "Kumpulkan materi Sistem Informasi",
        estimatedMinutes: 20,
        completed: false,
      },
      {
        id: 2,
        title: "Baca dan pahami materi",
        estimatedMinutes: 25,
        completed: false,
      },
      {
        id: 3,
        title: "Buat ringkasan materi",
        estimatedMinutes: 15,
        completed: false,
      },
    ],
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
    subtasks: [
      {
        id: 1,
        title: "Baca soal dan pahami ketentuan",
        estimatedMinutes: 20,
        completed: false,
      },
      {
        id: 2,
        title: "Buat algoritma penyelesaian",
        estimatedMinutes: 30,
        completed: false,
      },
      {
        id: 3,
        title: "Implementasikan solusi",
        estimatedMinutes: 50,
        completed: false,
      },
      {
        id: 4,
        title: "Testing dan perbaikan",
        estimatedMinutes: 20,
        completed: false,
      },
    ],
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
    subtasks: [
      {
        id: 1,
        title: "Baca kembali materi",
        estimatedMinutes: 15,
        completed: true,
      },
      {
        id: 2,
        title: "Tandai bagian yang belum dipahami",
        estimatedMinutes: 10,
        completed: true,
      },
      {
        id: 3,
        title: "Buat catatan review",
        estimatedMinutes: 20,
        completed: true,
      },
    ],
  },
];

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: initialTasks,

  setTasks: (tasks) => set({ tasks }),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task,
      ),
    })),

  toggleSubTask: (taskId, subTaskId) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const updatedSubtasks = task.subtasks.map((subTask) =>
          subTask.id === subTaskId
            ? {
                ...subTask,
                completed: !subTask.completed,
              }
            : subTask,
        );

        const hasSubtasks = updatedSubtasks.length > 0;

        const allSubtasksCompleted =
          hasSubtasks && updatedSubtasks.every((subTask) => subTask.completed);

        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted,
        };
      }),
    })),

  setSubTaskCompleted: (taskId, subTaskId, completed) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const updatedSubtasks = task.subtasks.map((subTask) =>
          subTask.id === subTaskId
            ? {
                ...subTask,
                completed,
              }
            : subTask,
        );

        const hasSubtasks = updatedSubtasks.length > 0;

        const allSubtasksCompleted =
          hasSubtasks && updatedSubtasks.every((subTask) => subTask.completed);

        return {
          ...task,
          subtasks: updatedSubtasks,
          completed: allSubtasksCompleted,
        };
      }),
    })),

  setTaskCompleted: (taskId, completed) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed,
            }
          : task,
      ),
    })),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
}));
