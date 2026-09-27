import { X } from "lucide-react";

type AddTaskFormProps = {
  showForm: boolean;
  setShowForm: (value: boolean) => void;

  title: string;
  setTitle: (value: string) => void;

  course: string;
  setCourse: (value: string) => void;

  dueDate: string;
  setDueDate: (value: string) => void;

  estimatedMinutes: number;
  setEstimatedMinutes: (value: number) => void;

  expectedOutput: string;
  setExpectedOutput: (value: string) => void;

  priority: "Rendah" | "Sedang" | "Tinggi";
  setPriority: (value: "Rendah" | "Sedang" | "Tinggi") => void;

  onAddTask: () => void;
};

export default function AddTaskForm({
  showForm,
  setShowForm,
  title,
  setTitle,
  course,
  setCourse,
  dueDate,
  setDueDate,
  estimatedMinutes,
  setEstimatedMinutes,
  expectedOutput,
  setExpectedOutput,
  priority,
  setPriority,
  onAddTask,
}: AddTaskFormProps) {
  if (!showForm) {
    return null;
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Tambah Tugas</h2>

          <p className="mt-1 text-xs text-slate-400">
            Masukkan informasi tugasmu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Tutup form"
        >
          <X size={18} />
        </button>
      </div>

      {/* Judul */}
      <div className="mt-5">
        <label className="text-sm font-medium text-slate-700">
          Judul tugas
        </label>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Contoh: Membuat laporan praktikum"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        />
      </div>

      {/* Mata Kuliah */}
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Mata kuliah
        </label>

        <input
          type="text"
          value={course}
          onChange={(event) => setCourse(event.target.value)}
          placeholder="Contoh: Pemrograman Web"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        />
      </div>

      {/* Deadline */}
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">Deadline</label>

        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        />
      </div>

      {/* Estimasi Waktu */}
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Estimasi waktu
        </label>

        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={estimatedMinutes}
            onChange={(event) =>
              setEstimatedMinutes(Number(event.target.value))
            }
            placeholder="Contoh: 60"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
          />

          <span className="text-sm text-slate-400">menit</span>
        </div>
      </div>

      {/* Output yang Diharapkan */}
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">
          Output yang diharapkan
        </label>

        <input
          type="text"
          value={expectedOutput}
          onChange={(event) => setExpectedOutput(event.target.value)}
          placeholder="Contoh: File laporan PDF"
          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        />
      </div>

      {/* Prioritas */}
      <div className="mt-4">
        <label className="text-sm font-medium text-slate-700">Prioritas</label>

        <select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as "Rendah" | "Sedang" | "Tinggi")
          }
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        >
          <option value="Rendah">Rendah</option>
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onAddTask}
        className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Simpan Tugas
      </button>
    </section>
  );
}
