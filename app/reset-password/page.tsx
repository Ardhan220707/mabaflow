"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, LoaderCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Cek apakah ada session reset password
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session);
      
      if (event === "PASSWORD_RECOVERY") {
        // User sedang dalam proses reset password
        setSuccess("Silakan set password baru kamu.");
      }
    });
  }, []);

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password belum cocok.");
      setLoading(false);
      return;
    }

    console.log("Setting new password");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    console.log("Update password result:", error);

    setLoading(false);

    if (error) {
      setError(`Gagal: ${error.message}`);
      return;
    }

    setSuccess("Password berhasil direset! Redirect ke login...");
    
    setTimeout(() => {
      router.replace("/login");
    }, 2000);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f2] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7efdf] text-2xl font-bold text-[#54734b]">
            M
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#283b2b]">
            Set Password Baru
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Masukkan password baru untuk akun kamu.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password Baru
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-[#78966b]">
              <Lock size={18} className="text-gray-400" />
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="w-full bg-transparent py-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Konfirmasi Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:border-[#78966b]">
              <Lock size={18} className="text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
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
            {loading ? "Menyimpan..." : "Set Password"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Ingat password?{" "}
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="font-semibold text-[#58764e] hover:underline"
          >
            Kembali ke Login
          </button>
        </p>
      </section>
    </main>
  );
}