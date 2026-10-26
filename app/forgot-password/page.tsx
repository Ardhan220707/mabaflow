"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Mail, LoaderCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("Reset password attempt:", { email: email.trim() });

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    console.log("Reset password result:", error);

    setLoading(false);

    if (error) {
      setError(`Gagal: ${error.message}`);
      return;
    }

    setSuccess("Link reset password telah dikirim ke email kamu. Cek inbox (termasuk spam folder).");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f2] px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#e5e9df] bg-white p-7 shadow-sm sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7efdf] text-2xl font-bold text-[#54734b]">
            M
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#283b2b]">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Masukkan email untuk reset password.
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-5">
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
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-500">
          Ingat password?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#58764e] hover:underline"
          >
            Kembali ke Login
          </Link>
        </p>
      </section>
    </main>
  );
}