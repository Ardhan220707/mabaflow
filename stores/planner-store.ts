import { create } from "zustand";

export type PlannerItem = {
  id: number;
  taskId: number;
  subTaskId: number | null;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
};

type PlannerStore = {
  plannerItems: PlannerItem[];

  addPlannerItem: (item: PlannerItem) => void;

  togglePlannerItem: (id: number) => void;
};

const initialPlannerItems: PlannerItem[] = [
  {
    id: 1,
    taskId: 1,
    subTaskId: 2,
    title: "Baca dan pahami materi",
    date: "2026-09-28",
    startTime: "08:00",
    endTime: "08:25",
    completed: false,
  },
  {
    id: 2,
    taskId: 2,
    subTaskId: 1,
    title: "Baca soal dan pahami ketentuan",
    date: "2026-09-28",
    startTime: "10:00",
    endTime: "10:20",
    completed: false,
  },
];

export const usePlannerStore = create<PlannerStore>((set) => ({
  plannerItems: initialPlannerItems,

  addPlannerItem: (item) =>
    set((state) => ({
      plannerItems: [...state.plannerItems, item],
    })),

  togglePlannerItem: (id) =>
    set((state) => ({
      plannerItems: state.plannerItems.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
            }
          : item,
      ),
    })),
}));
