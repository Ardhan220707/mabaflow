'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { taskService, type TaskWithSubtasks } from '@/lib/database/task-service';
import { useTaskStore } from '@/stores/task-store';

export function useTaskSync() {
  const { user } = useUser();
  const { tasks, setTasks, addTask, setTaskCompleted, toggleSubTask, setSubTaskCompleted } = useTaskStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const loadTasks = async (userId: string) => {
    setIsSyncing(true);
    try {
      const dbTasks = await taskService.getTasks(userId);
      setTasks(dbTasks);
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

  const handleAddTask = async (task: TaskWithSubtasks) => {
    addTask(task);
    if (user) {
      await syncToDatabase(task);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setTaskCompleted(taskId, !task.completed);

    if (user) {
      try {
        await taskService.updateTask(taskId, { completed: !task.completed });
      } catch (error) {
        console.error('Failed to update task completion:', error);
        setTaskCompleted(taskId, task.completed);
      }
    }
  };

  const handleToggleSubTask = async (taskId: string, subTaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const subtask = task.subtasks.find(s => s.id === subTaskId);
    if (!subtask) return;

    toggleSubTask(taskId, subTaskId);

    if (user) {
      try {
        await taskService.toggleSubtask(subTaskId);
        await taskService.updateTaskCompletion(taskId);
      } catch (error) {
        console.error('Failed to update subtask:', error);
        toggleSubTask(taskId, subTaskId);
      }
    }
  };

  const handleSetSubTaskCompleted = async (taskId: string, subTaskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setSubTaskCompleted(taskId, subTaskId, completed);

    if (user) {
      try {
        await taskService.updateSubtask(subTaskId, { completed });
        await taskService.updateTaskCompletion(taskId);
      } catch (error) {
        console.error('Failed to update subtask:', error);
        setSubTaskCompleted(taskId, subTaskId, !completed);
      }
    }
  };

  useEffect(() => {
    if (user) {
      loadTasks(user.id);
    } else {
      setTasks([]);
    }
  }, [user]);

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