"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <div className="theme-ink flex h-16 items-center justify-center border-b border-line bg-header pt-[env(safe-area-inset-top)]">
        <Logo size="sm" animated />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="border-t-[3px] border-line-strong bg-canvas p-8">
          <p className="kicker text-accent-ink">Newsroom</p>
          <h1 className="display mt-3 text-5xl uppercase leading-[0.9] text-ink">Sign in</h1>
          <p className="mb-6 mt-3 text-sm text-ink-muted">Admin access to Tollab Nation.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1">Email</label>
              <input
                id="email"
                autoComplete="username"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1">Password</label>
              <input
                id="password"
                autoComplete="current-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-line bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {error && (
              <p className="text-sm text-accent font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full px-4 bg-accent text-white rounded-full text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
