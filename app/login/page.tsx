"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail, Lock, LoaderCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError("Email atau password salah. Coba periksa kembali.");
      setLoading(false);
      return;
    }

    router.replace("/beranda");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/beranda`,
      },
    });

    if (error) setError(error.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f2] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7efdf] text-2xl font-bold text-[#54734b]">
            M
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#283b2b]">
            Selamat datang!
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Masuk ke akun MabaFlow dan atur harimu.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
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

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#58764e] py-3.5 font-semibold text-white transition hover:bg-[#466440] disabled:opacity-60"
          >
            {loading && <LoaderCircle size={18} className="animate-spin" />}
            {loading ? "Sedang masuk..." : "Masuk"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400">atau lanjutkan dengan</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 py-3.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <span className="font-bold text-base">G</span>
          Masuk dengan Google
        </button>

        <p className="mt-7 text-center text-sm text-gray-500">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#58764e] hover:underline"
          >
            Daftar sekarang
          </Link>
        </p>
      </section>
    </main>
  );
}
