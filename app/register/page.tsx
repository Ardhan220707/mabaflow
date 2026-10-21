"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail, Lock, User, LoaderCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password belum cocok.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/beranda`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.replace("/beranda");
      router.refresh();
      return;
    }

    setSuccess(
      "Pendaftaran berhasil! Silakan cek email untuk mengonfirmasi akun sebelum masuk.",
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f2] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7efdf] text-2xl font-bold text-[#54734b]">
            M
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#283b2b]">
            Buat akunmu
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Mulai kelola tugas dan waktumu bersama MabaFlow.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Nama lengkap
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-[#78966b]">
              <User size={18} className="text-gray-400" />
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className="w-full bg-transparent py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-[#78966b]">
              <Mail size={18} className="text-gray-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full bg-transparent py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-[#78966b]">
              <Lock size={18} className="text-gray-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full bg-transparent py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Konfirmasi password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-[#78966b]">
              <Lock size={18} className="text-gray-400" />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full bg-transparent py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
            >
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#58764e] py-3.5 font-semibold text-white transition hover:bg-[#466440] disabled:opacity-60"
          >
            {loading && <LoaderCircle size={18} className="animate-spin" />}
            {loading ? "Membuat akun..." : "Daftar"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#58764e] hover:underline"
          >
            Masuk
          </Link>
        </p>
      </section>
    </main>
  );
}
