"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-16">
      <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
      <p className="text-sm text-inksoft mb-6">Welcome back to Nirog.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-line rounded-lg px-3 py-2.5 text-sm outline-none focus:border-teal"
        />
        {error && <p className="text-redx text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-deep text-white font-semibold rounded-lg py-2.5 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-sm text-inksoft mt-5">
        Don't have an account? <Link href="/register" className="text-teal-deep font-medium">Create one</Link>
      </p>
      <div className="mt-8 text-xs text-inksoft bg-mint border border-line rounded-lg p-3">
        Demo accounts (after seeding): <br />
        Admin — admin@nirog.example / Admin123! <br />
        Customer — customer@nirog.example / Customer123!
      </div>
    </main>
  );
}
