import type { TaskWithSubtasks } from "@/lib/database/task-service";

export type SubTask = {
  id: number;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
};

export type Task = {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  estimatedMinutes: number;
  expectedOutput: string;
  priority: "Rendah" | "Sedang" | "Tinggi";
  completed: boolean;
  subtasks: SubTask[];
};

export function mapTaskToDatabase(task: Task): Omit<TaskWithSubtasks, 'user_id'> {
  return {
    id: task.id.toString(),
    title: task.title,
    course: task.course,
    due_date: task.dueDate,
    estimated_minutes: task.estimatedMinutes,
    expected_output: task.expectedOutput || null,
    priority: task.priority,
    completed: task.completed,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    subtasks: task.subtasks.map(subtask => ({
      id: subtask.id.toString(),
      task_id: task.id.toString(),
      title: subtask.title,
      estimated_minutes: subtask.estimatedMinutes,
      completed: subtask.completed,
      created_at: new Date().toISOString(),
    })),
  };
}

export function mapDatabaseToTask(task: TaskWithSubtasks): Task {
  return {
    id: parseInt(task.id, 10),
    title: task.title,
    course: task.course,
    dueDate: task.due_date,
    estimatedMinutes: task.estimated_minutes,
    expectedOutput: task.expected_output || "",
    priority: task.priority,
    completed: task.completed,
    subtasks: task.subtasks.map(subtask => ({
      id: parseInt(subtask.id, 10),
      title: subtask.title,
      estimatedMinutes: subtask.estimated_minutes,
      completed: subtask.completed,
    })),
  };
}

export function mapDatabaseToTaskArray(tasks: TaskWithSubtasks[]): Task[] {
  return tasks.map(mapDatabaseToTask);
}