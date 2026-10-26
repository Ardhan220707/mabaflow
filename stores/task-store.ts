import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task } from "@/lib/types/mapping";
import { mapTaskToDatabase, mapDatabaseToTaskArray } from "@/lib/types/mapping";

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

const initialTasks: Task[] = [];

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: initialTasks,

      setTasks: (tasks) => set({ tasks }),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task,
          ),
        })),

      toggleSubTask: (taskId, subTaskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            const updatedSubtasks = task.subtasks.map((subTask) =>
              subTask.id === subTaskId
                ? { ...subTask, completed: !subTask.completed }
                : subTask,
            );

            return {
              ...task,
              subtasks: updatedSubtasks,
              completed:
                updatedSubtasks.length > 0 &&
                updatedSubtasks.every((subTask) => subTask.completed),
            };
          }),
        })),

      setSubTaskCompleted: (taskId, subTaskId, completed) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            const updatedSubtasks = task.subtasks.map((subTask) =>
              subTask.id === subTaskId ? { ...subTask, completed } : subTask,
            );

            return {
              ...task,
              subtasks: updatedSubtasks,
              completed:
                updatedSubtasks.length > 0 &&
                updatedSubtasks.every((subTask) => subTask.completed),
            };
          }),
        })),

      setTaskCompleted: (taskId, completed) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId) return task;

            return {
              ...task,
              completed,
              subtasks: task.subtasks.map((subtask) => ({
                ...subtask,
                completed,
              })),
            };
          }),
        })),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),
    }),
    {
      name: "mabaflow-tasks-v2", // Changed to clear old data
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
