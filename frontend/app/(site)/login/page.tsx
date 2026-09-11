"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = await login(email, password);
    if (result.error) {
      setError(result.error);
    } else {
      window.location.href = "/";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm p-8">
      <h1 className="mb-4 text-xl font-bold">Iniciar sesión</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-2 w-full rounded border p-2"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full rounded border p-2"
      />
      <button type="submit" className="w-full rounded bg-brand p-2 text-white">
        Entrar
      </button>
    </form>
  );
}
