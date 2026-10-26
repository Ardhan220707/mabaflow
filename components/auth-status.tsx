"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AuthStatus() {
  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!active) return;

      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data, error }: any) => {
      if (!active) return;

      if (error) {
        setError("Gagal memeriksa status login.");
      } else {
        setUser(data.session?.user ?? null);
      }

      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError("Logout gagal. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    setUser(null);
    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="text-sm text-gray-500">Memeriksa status login...</div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <UserRound size={18} />
          Belum login
        </div>

        <Link
          href="/login"
          className="inline-flex w-fit items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          <LogIn size={16} />
          Login
        </Link>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-green-700">
        <UserRound size={18} />
        <span>Sudah login</span>
      </div>

      <p className="break-all text-sm text-gray-600">
        {user.email ?? "Pengguna MabaFlow"}
      </p>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        <LogOut size={16} />
        Logout
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
