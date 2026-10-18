import { X, ClipboardList } from "lucide-react";

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
  if (!showForm) return null;

  const labelStyle = "text-sm font-medium text-[#355746]";

  const inputStyle =
    "mt-2 w-full rounded-xl border border-[#D5E2D3] bg-white px-4 py-3 text-sm text-[#183D32] placeholder:text-[#91A398] outline-none transition focus:border-[#43865F] focus:ring-2 focus:ring-[#DCEBDD]";

  return (
    <section className="mt-4 rounded-2xl border border-[#E2EAE0] bg-white p-5 shadow-[0_4px_18px_rgba(24,61,50,0.05)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3E8] text-[#17664E]">
            <ClipboardList size={20} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#183D32]">
              Tambah Tugas
            </h2>
            <p className="mt-1 text-xs text-[#82978A]">
              Susun tugasmu agar lebih terorganisir.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-xl p-2 text-[#82978A] transition hover:bg-[#F1F5EE] hover:text-[#183D32]"
          aria-label="Tutup form"
        >
          <X size={19} />
        </button>
      </div>

      {/* Judul */}
      <div className="mt-5">
        <label htmlFor="task-title" className={labelStyle}>
          Judul tugas
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Contoh: Membuat laporan praktikum"
          className={inputStyle}
        />
      </div>

      {/* Mata kuliah */}
      <div className="mt-4">
        <label htmlFor="task-course" className={labelStyle}>
          Mata kuliah
        </label>
        <input
          id="task-course"
          type="text"
          value={course}
          onChange={(event) => setCourse(event.target.value)}
          placeholder="Contoh: Pemrograman Web"
          className={inputStyle}
        />
      </div>

      {/* Deadline */}
      <div className="mt-4">
        <label htmlFor="task-deadline" className={labelStyle}>
          Deadline
        </label>
        <input
          id="task-deadline"
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className={inputStyle}
        />
      </div>

      {/* Estimasi waktu */}
      <div className="mt-4">
        <label htmlFor="task-duration" className={labelStyle}>
          Estimasi waktu
        </label>
        <div className="flex items-center gap-3">
          <input
            id="task-duration"
            type="number"
            min="1"
            value={estimatedMinutes}
            onChange={(event) =>
              setEstimatedMinutes(Number(event.target.value))
            }
            className={inputStyle}
          />
          <span className="shrink-0 text-sm font-medium text-[#668071]">
            menit
          </span>
        </div>
      </div>

      {/* Output */}
      <div className="mt-4">
        <label htmlFor="task-output" className={labelStyle}>
          Output yang diharapkan
        </label>
        <input
          id="task-output"
          type="text"
          value={expectedOutput}
          onChange={(event) => setExpectedOutput(event.target.value)}
          placeholder="Contoh: File laporan PDF"
          className={inputStyle}
        />
      </div>

      {/* Prioritas */}
      <div className="mt-4">
        <label htmlFor="task-priority" className={labelStyle}>
          Prioritas
        </label>
        <select
          id="task-priority"
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value as "Rendah" | "Sedang" | "Tinggi")
          }
          className={inputStyle}
        >
          <option value="Rendah">Rendah</option>
          <option value="Sedang">Sedang</option>
          <option value="Tinggi">Tinggi</option>
        </select>
      </div>

      {/* Simpan */}
      <button
        type="button"
        onClick={onAddTask}
        className="mt-6 w-full rounded-xl bg-[#17664E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#12543F] active:scale-[0.99]"
      >
        Simpan Tugas
      </button>
    </section>
  );
}
