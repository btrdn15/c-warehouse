"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      const from = searchParams.get("from") || "/";
      router.push(from);
      router.refresh();
    } else {
      setError("Буруу нууц үг");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-gray-900">Нэвтрэх</h1>
      <p className="mt-1 text-sm text-gray-500">
        Зөвхөн зөвшөөрөгдсөн хүмүүс нэвтэрнэ
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Нууц үг
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Шалгаж байна..." : "Нэвтрэх"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Suspense
        fallback={
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
