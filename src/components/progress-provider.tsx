"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import type { Progress } from "@/lib/types";
import {
  emptyProgress,
  parseProgress,
  isProgress,
  STORAGE_KEY,
} from "@/lib/progress";
import { browserSupabase } from "@/lib/supabase";
type Store = {
  state: Progress;
  ready: boolean;
  user: { id: string; email?: string } | null;
  sync: string;
  update: (fn: (p: Progress) => Progress, message?: string) => void;
  notify: (text: string) => void;
  logout: () => Promise<void>;
};
const Context = createContext<Store | null>(null);
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(emptyProgress),
    [ready, setReady] = useState(false),
    [user, setUser] = useState<Store["user"]>(null),
    [sync, setSync] = useState("Local progress"),
    [toast, setToast] = useState("");
  const current = useRef(state),
    identity = useRef<string | null | undefined>(undefined),
    generation = useRef(0),
    revision = useRef(0),
    writable = useRef(false),
    queue = useRef(Promise.resolve()),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((text: string) => {
    setToast(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  useEffect(() => {
    let active = true;
    const client = browserSupabase();
    async function load(id: string | null, email?: string) {
      const gen = ++generation.current;
      identity.current = id;
      writable.current = false;
      current.current = emptyProgress();
      setState(current.current);
      setReady(false);
      setUser(id ? { id, email } : null);
      try {
        let next = emptyProgress();
        if (id && client) {
          setSync("Loading cloud progress…");
          const { data, error } = await client
            .from("user_state")
            .select("state,revision")
            .eq("user_id", id)
            .maybeSingle();
          if (!active || gen !== generation.current) return;
          if (error) throw error;
          if (data && !isProgress(data.state))
            throw new Error("Cloud progress format is invalid.");
          next = data?.state ?? next;
          revision.current = data?.revision ?? 0;
          setSync("Cloud synced");
        } else {
          const raw = localStorage.getItem(STORAGE_KEY);
          next = parseProgress(raw);
          if (!raw)
            next.preferences.timezone =
              Intl.DateTimeFormat().resolvedOptions().timeZone;
          setSync("Saved on this device");
        }
        if (active && gen === generation.current) {
          current.current = next;
          setState(next);
          writable.current = true;
        }
      } catch (e) {
        if (active && gen === generation.current) {
          setSync("Progress unavailable · export before reloading");
          notify(e instanceof Error ? e.message : "Could not load progress.");
        }
      } finally {
        if (active && gen === generation.current) setReady(true);
      }
    }
    const subscription = client?.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT")
          setTimeout(() => {
            if (active && identity.current !== (session?.user.id ?? null))
              void load(session?.user.id ?? null, session?.user.email);
          }, 0);
      },
    ).data.subscription;
    if (client)
      void client.auth
        .getUser()
        .then(({ data }: { data: { user: User | null } }) => {
          if (active && identity.current === undefined)
            void load(data.user?.id ?? null, data.user?.email);
        })
        .catch(() => {
          if (active) void load(null);
        });
    else void load(null);
    function storage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || identity.current !== null) return;
      try {
        current.current = parseProgress(e.newValue);
        setState(current.current);
      } catch {
        writable.current = false;
        setSync("Progress unavailable · export before reloading");
      }
    }
    window.addEventListener("storage", storage);
    return () => {
      active = false;
      subscription?.unsubscribe();
      window.removeEventListener("storage", storage);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [notify]);
  useEffect(() => {
    document.documentElement.dataset.theme = state.preferences.theme;
  }, [state.preferences.theme]);
  const update = useCallback(
    (fn: (p: Progress) => Progress, message?: string) => {
      if (!writable.current) {
        notify("Progress is not writable yet. Reload to retry.");
        return;
      }
      const next = fn(current.current);
      if (next === current.current) return;
      current.current = next;
      setState(next);
      const id = identity.current;
      if (!id) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          setSync("Saved on this device");
        } catch {
          setSync("Save failed · export before leaving");
          notify(
            "Browser storage is unavailable. Export your progress from Profile.",
          );
        }
      } else {
        setSync("Saving…");
        queue.current = queue.current
          .then(async () => {
            if (identity.current !== id || !writable.current) return;
            const { data, error } = await browserSupabase()!.rpc(
              "save_progress",
              { payload: next, expected_revision: revision.current },
            );
            if (identity.current !== id) return;
            if (error) {
              writable.current = false;
              setSync("Cloud save failed · export before reloading");
              notify(
                "Save failed or conflicted. Export your progress before reloading.",
              );
              return;
            }
            revision.current = Number(data);
            setSync("Cloud synced");
          })
          .catch(() => {
            if (identity.current !== id) return;
            writable.current = false;
            setSync("Cloud save failed · export before reloading");
          });
      }
      if (message) notify(message);
    },
    [notify],
  );
  async function logout() {
    await queue.current;
    const result = await browserSupabase()?.auth.signOut();
    if (result?.error) notify(result.error.message);
    else notify("Signed out. Guest progress is separate.");
  }
  return (
    <Context.Provider
      value={{ state, ready, user, sync, update, notify, logout }}
    >
      {children}
      {toast && (
        <div role="status" className="toast">
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
      {sync.includes("failed") && (
        <div role="alert" className="save-warning">
          {sync}
        </div>
      )}
    </Context.Provider>
  );
}
export function useProgress() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing progress provider");
  return value;
}
