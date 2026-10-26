import { createClient } from "@/lib/supabase/client";

export interface DatabaseTask {
  id: string;
  user_id: string;
  title: string;
  course: string;
  due_date: string;
  estimated_minutes: number;
  expected_output: string | null;
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSubtask {
  id: string;
  task_id: string;
  title: string;
  estimated_minutes: number;
  completed: boolean;
  created_at: string;
}

export interface TaskWithSubtasks extends DatabaseTask {
  subtasks: DatabaseSubtask[];
}

export interface UserSettings {
  user_id: string;
  notifications_enabled: boolean;
  dark_mode: boolean;
  language: string;
  created_at: string;
  updated_at: string;
}

class TaskService {
  private supabase = createClient();

  // Task methods
  async getTasks(userId: string): Promise<TaskWithSubtasks[]> {
    const { data: tasks, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const tasksWithSubtasks: TaskWithSubtasks[] = [];
    
    for (const task of tasks || []) {
      const subtasks = await this.getSubtasks(task.id);
      tasksWithSubtasks.push({ ...task, subtasks });
    }

    return tasksWithSubtasks;
  }

  async getTask(taskId: string): Promise<TaskWithSubtasks | null> {
    const { data: task, error } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) throw error;
    if (!task) return null;

    const subtasks = await this.getSubtasks(task.id);
    return { ...task, subtasks };
  }

  async createTask(task: Omit<DatabaseTask, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseTask> {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateTask(taskId: string, updates: Partial<DatabaseTask>): Promise<DatabaseTask> {
    const { data, error } = await this.supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  }

  // Subtask methods
  async getSubtasks(taskId: string): Promise<DatabaseSubtask[]> {
    const { data, error } = await this.supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  async createSubtask(subtask: Omit<DatabaseSubtask, 'id' | 'created_at'>): Promise<DatabaseSubtask> {
    const { data, error } = await this.supabase
      .from('subtasks')
      .insert([subtask])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubtask(subtaskId: string, updates: Partial<DatabaseSubtask>): Promise<DatabaseSubtask> {
    const { data, error } = await this.supabase
      .from('subtasks')
      .update(updates)
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSubtask(subtaskId: string): Promise<void> {
    const { error } = await this.supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) throw error;
  }

  async toggleSubtask(subtaskId: string): Promise<DatabaseSubtask> {
    const { data: subtask } = await this.supabase
      .from('subtasks')
      .select('*')
      .eq('id', subtaskId)
      .single();

    if (!subtask) throw new Error('Subtask not found');

    return this.updateSubtask(subtaskId, { completed: !subtask.completed });
  }

  async updateTaskCompletion(taskId: string): Promise<void> {
    const subtasks = await this.getSubtasks(taskId);
    
    if (subtasks.length > 0) {
      const allCompleted = subtasks.every(subtask => subtask.completed);
      await this.updateTask(taskId, { completed: allCompleted });
    }
  }

  // User settings methods
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUserSettings(userId: string, settings?: Partial<UserSettings>): Promise<UserSettings> {
    const defaultSettings = {
      user_id: userId,
      notifications_enabled: true,
      dark_mode: false,
      language: 'id',
      ...settings
    };

    const { data, error } = await this.supabase
      .from('user_settings')
      .insert([defaultSettings])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Bulk operations
  async syncTasks(userId: string, tasks: TaskWithSubtasks[]): Promise<void> {
    // This could be used for initial sync or backup
    for (const task of tasks) {
      const existing = await this.getTask(task.id).catch(() => null);
      
      if (existing) {
        await this.updateTask(task.id, task);
        
        // Update subtasks
        for (const subtask of task.subtasks) {
          const existingSubtask = existing.subtasks.find(s => s.id === subtask.id);
          if (existingSubtask) {
            await this.updateSubtask(subtask.id, subtask);
          } else {
            await this.createSubtask(subtask);
          }
        }
      } else {
        const { subtasks, ...taskData } = task;
        const newTask = await this.createTask(taskData);
        
        for (const subtask of subtasks) {
          await this.createSubtask({ ...subtask, task_id: newTask.id });
        }
      }
    }
  }
}

export const taskService = new TaskService();