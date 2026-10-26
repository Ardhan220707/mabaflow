# Database Multi-user untuk MabaFlow

## Overview
Implementasi database Supabase untuk menyimpan tugas per akun user. Setiap user memiliki data tasks dan subtasks sendiri-sendiri.

## Struktur Database

### Tables
1. `tasks` - Tugas utama user
2. `subtasks` - Subtask dari tugas utama  
3. `user_settings` - Pengaturan user

### Schema
```sql
-- File: lib/database/schema.sql
```

### Security
- Row Level Security (RLS) diaktifkan untuk semua tables
- User hanya bisa mengakses data mereka sendiri
- Foreign key constraints untuk integritas data

## Service Layer

### TaskService (`lib/database/task-service.ts`)
Service untuk mengelola data tasks dengan Supabase:

```typescript
const taskService = new TaskService();

// Contoh penggunaan
const tasks = await taskService.getTasks(userId);
const newTask = await taskService.createTask(taskData);
```

### Hooks (`hooks/use-task-sync.ts`)
Hook React untuk menyinkronkan state lokal dengan database:

```typescript
const { tasks, handleAddTask, handleToggleTask } = useTaskSync();
```

### Type Mapping (`lib/types/mapping.ts`)
Adapter untuk konversi antara tipe komponen dan database:

```typescript
// Komponen → Database
const dbTask = mapTaskToDatabase(componentTask);

// Database → Komponen  
const componentTask = mapDatabaseToTask(dbTask);
```

## Integrasi dengan Existing Code

### TaskStore (`stores/task-store.ts`)
Store Zustand tetap sama, hanya tipe berubah ke `string` untuk ID.

### Task Components
Komponen tasks tetap bekerja dengan tipe lama (`id: number`). Mapping otomatis di handle di `use-task-sync`.

## Migrasi Data

1. **Fresh Installation**: Tidak perlu migrasi
2. **Existing Users**: Data localStorage tetap accessible saat offline

### Flow Migrasi
1. User login pertama kali
2. System cek data di database
3. Jika kosong, coba ambil dari localStorage
4. Sync ke database jika ada data localStorage

## Security Features

1. **Authentication Required**: Hanya authenticated users bisa akses database
2. **Row Level Security**: User isolation at database level
3. **Input Validation**: SQL injection protection via Supabase
4. **Type Safety**: TypeScript interface untuk semua operations

## Deployment Steps

1. Copy SQL schema ke Supabase SQL Editor
2. Jalankan migration script
3. Update environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```
4. Build dan deploy aplikasi

## Testing

### Manual Testing
- Login user A, buat tasks
- Login user B, verify tasks berbeda
- Check localStorage fallback saat offline

### Automated Testing
```bash
# Add test scripts to package.json jika diperlukan
npm run test:database
```

## Backup & Recovery

### Data Export
```typescript
// Export semua tasks user
const tasks = await taskService.getTasks(userId);
// Save to JSON file
```

### Data Import
```typescript
// Import tasks ke database baru
await taskService.syncTasks(userId, importedTasks);
```

## Performance Considerations

1. **Indexes**: Sudah dibuat untuk queries umum
2. **Pagination**: Support limit/offset untuk banyak data
3. **Caching**: Zustand store sebagai cache client-side
4. **Batch Operations**: `syncTasks()` untuk bulk operations

## Error Handling

1. **Network Failure**: Fallback ke localStorage
2. **Permission Errors**: Clear auth dan redirect ke login
3. **Data Corruption**: Validation di client dan server side
4. **Sync Conflicts**: Last-write-wins dengan timestamp

## Next Steps

1. **Realtime Updates**: Supabase subscriptions
2. **Offline Sync**: Background sync queue
3. **Data Analytics**: Task completion statistics
4. **Backup Scheduler**: Auto-backup ke cloud storage