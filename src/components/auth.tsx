"use client";
import type { AuthChangeEvent } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import Link from "next/link";
import { browserSupabase, cloudConfigured } from "@/lib/supabase";
import { Heading } from "./widgets";
type Mode = "login" | "signup" | "reset-password" | "update-password";
export function Auth({ mode = "login" }: { mode?: Mode }) {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [recovery, setRecovery] = useState(false);
  useEffect(() => {
    const client = browserSupabase();
    if (mode !== "update-password" || !client) return;
    const { data } = client.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, [mode]);
  async function submit() {
    setBusy(true);
    try {
      const client = browserSupabase();
      if (!client) throw Error("Cloud authentication is not configured.");
      let error;
      if (mode === "signup")
        ({ error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/login` },
        }));
      else if (mode === "reset-password")
        ({ error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/update-password`,
        }));
      else if (mode === "update-password") {
        if (!recovery)
          throw Error("Open a fresh recovery link from your email.");
        ({ error } = await client.auth.updateUser({ password }));
      } else
        ({ error } = await client.auth.signInWithPassword({ email, password }));
      if (error) throw error;
      setMessage(
        mode === "signup"
          ? "Check your email to confirm your account."
          : mode === "reset-password"
            ? "If this address has an account, a recovery email will arrive shortly."
            : mode === "update-password"
              ? "Password updated. You can return to the dashboard."
              : "Signed in. Open your dashboard.",
      );
      setPassword("");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const title = {
    login: "Welcome back",
    signup: "Start your learning journey",
    "reset-password": "Reset your password",
    "update-password": "Choose a new password",
  }[mode];
  return (
    <div className="auth card pad">
      <Heading
        title={title}
        description="Your next breakthrough starts with a little practice."
      />
      {!cloudConfigured && (
        <p className="callout">
          Demo mode: cloud authentication is not configured. Your learning
          progress is saved on this device.
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {mode !== "update-password" && (
          <label className="field">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {mode !== "reset-password" && (
          <label className="field">
            Password
            <input
              required
              minLength={8}
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        <button
          className="button primary"
          disabled={
            !cloudConfigured ||
            busy ||
            (mode === "update-password" && !recovery)
          }
        >
          {busy
            ? "Please wait…"
            : {
                login: "Sign in",
                signup: "Create account",
                "reset-password": "Send recovery email",
                "update-password": "Update password",
              }[mode]}
        </button>
      </form>
      <p role="status">{message}</p>
      <div className="stack section">
        <Link
          href={mode === "signup" ? "/auth/login" : "/auth/signup"}
          className="text-link"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "Create an account"}
        </Link>
        {mode === "login" && (
          <Link href="/auth/reset-password" className="text-link">
            Forgot password?
          </Link>
        )}
        <Link href="/dashboard" className="text-link">
          Continue to dashboard →
        </Link>
      </div>
    </div>
  );
}
