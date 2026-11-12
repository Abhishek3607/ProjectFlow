"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      const slug = data.data.workspace?.slug;
      router.push(slug ? `/${slug}` : "/");
    } catch {
      setError("Cannot reach API server. Make sure apps/api is running on port 4000.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0e0e10] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-semibold text-lg">
            <span className="h-7 w-7 rounded-md bg-white text-black flex items-center justify-center font-bold text-sm">
              P
            </span>
            ProjectFlow
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-white pt-2">
            Sign in to your workspace
          </h1>
          <p className="text-sm text-zinc-400">
            Enter your credentials to access your projects.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#161618] border border-zinc-800/80 rounded-xl p-6 space-y-4 shadow-2xl"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Work Email</label>
            <input
              type="email"
              required
              placeholder="abhishek@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[#0e0e10] border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-black font-medium text-sm py-2.5 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-500">
          Don&apos;t have a workspace?{" "}
          <Link href="/register" className="text-zinc-300 hover:text-white underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}