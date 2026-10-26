'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { taskService, type TaskWithSubtasks } from '@/lib/database/task-service';
import { useTaskStore } from '@/stores/task-store';
import { mapDatabaseToTaskArray } from '@/lib/types/mapping';
import type { Task } from '@/lib/types/mapping';

export function useTaskSync() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const { tasks, setTasks, addTask, setTaskCompleted, toggleSubTask, setSubTaskCompleted } = useTaskStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const loadTasks = async (userId: string) => {
    setIsSyncing(true);
    try {
      const dbTasks = await taskService.getTasks(userId);
      setTasks(mapDatabaseToTaskArray(dbTasks));
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncToDatabase = async (task: TaskWithSubtasks) => {
    if (!user) return;

    try {
      const { subtasks, ...taskData } = task;
      const dbTask = await taskService.createTask({
        ...taskData,
        user_id: user.id,
      });

      for (const subtask of subtasks) {
        await taskService.createSubtask({
          ...subtask,
          task_id: dbTask.id,
        });
      }
    } catch (error) {
      console.error('Failed to sync task:', error);
    }
  };

  const handleAddTask = async (task: Task) => {
    if (!user) return;

    const taskWithSubtasks: TaskWithSubtasks = {
      id: String(task.id),
      user_id: user.id,
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
        id: String(subtask.id),
        task_id: String(task.id),
        title: subtask.title,
        estimated_minutes: subtask.estimatedMinutes,
        completed: subtask.completed,
        created_at: new Date().toISOString(),
      })),
    };

    addTask(task);
    await syncToDatabase(taskWithSubtasks);
  };

  const handleToggleTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTaskCompleted(taskId, !task.completed);

    try {
      await taskService.updateTask(String(taskId), { completed: !task.completed });
    } catch (error) {
      console.error('Failed to update task completion:', error);
      setTaskCompleted(taskId, task.completed);
    }
  };

  const handleToggleSubTask = async (taskId: number, subTaskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subTaskId);
    if (!subtask) return;

    toggleSubTask(taskId, subTaskId);

    try {
      await taskService.toggleSubtask(String(subTaskId));
      await taskService.updateTaskCompletion(String(taskId));
    } catch (error) {
      console.error('Failed to update subtask:', error);
      toggleSubTask(taskId, subTaskId);
    }
  };

  const handleSetSubTaskCompleted = async (taskId: number, subTaskId: number, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setSubTaskCompleted(taskId, subTaskId, completed);

    try {
      await taskService.updateSubtask(String(subTaskId), { completed });
      await taskService.updateTaskCompletion(String(taskId));
    } catch (error) {
      console.error('Failed to update subtask:', error);
      setSubTaskCompleted(taskId, subTaskId, !completed);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) {
        await loadTasks(currentUser.id);
      } else {
        setTasks([]);
      }
    };

    getUser();
  }, []);

  return {
    tasks,
    isSyncing,
    handleAddTask,
    handleToggleTask,
    handleToggleSubTask,
    handleSetSubTaskCompleted,
    refreshTasks: user ? () => loadTasks(user.id) : undefined,
  };
}