"use client";

import { useState, useSyncExternalStore } from "react";

type Snapshot<T> = { value: T; ready: boolean; persisted: boolean; error: string | null };
type Store<T> = { subscribe: (listener: () => void) => () => void; snapshot: () => Snapshot<T>; server: () => Snapshot<T>; save: (value: T) => boolean };
const stores = new Map<string, Store<unknown>>();

function browserStore<T>(key: string, initial: T, valid: (value: unknown) => value is T): Store<T> {
  const existing = stores.get(key);
  if (existing) return existing as Store<T>;
  const server: Snapshot<T> = { value: initial, ready: false, persisted: false, error: null };
  let current = server;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach(listener => listener());
  function read() {
    try {
      const raw = localStorage.getItem(key);
      const parsed: unknown = raw === null ? initial : JSON.parse(raw);
      current = valid(parsed)
        ? { value: parsed, ready: true, persisted: raw !== null, error: null }
        : { value: initial, ready: true, persisted: false, error: "Saved browser data could not be read. Demo defaults are shown." };
    } catch {
      current = { value: initial, ready: true, persisted: false, error: "Browser storage is unavailable. Changes have not been saved." };
    }
  }
  const store: Store<T> = {
    snapshot: () => current,
    server: () => server,
    subscribe(listener) {
      if (!current.ready) read();
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => { if (event.key === key || event.key === null) { read(); notify(); } };
      window.addEventListener("storage", onStorage);
      return () => { listeners.delete(listener); window.removeEventListener("storage", onStorage); };
    },
    save(value) {
      try {
        if (!valid(value)) throw new Error("Invalid data");
        localStorage.setItem(key, JSON.stringify(value));
        current = { value, ready: true, persisted: true, error: null };
        notify();
        return true;
      } catch {
        current = { ...current, error: "Could not save to this browser. Your edits are still available; try again or check browser storage permissions." };
        notify();
        return false;
      }
    },
  };
  stores.set(key, store as Store<unknown>);
  return store;
}

/** Local prototype persistence only. Never use for credentials or production policy. */
export function useBrowserRecord<T>(key: string, initial: T, valid: (value: unknown) => value is T) {
  const store = browserStore(key, initial, valid);
  const snapshot = useSyncExternalStore(store.subscribe, store.snapshot, store.server);
  return { ...snapshot, save: store.save };
}

export function useBrowserDraft<T>(key: string, initial: T, valid: (value: unknown) => value is T) {
  const record = useBrowserRecord(key, initial, valid);
  const [draft, setDraft] = useState<T | null>(null);
  const [message, setMessage] = useState("");
  const value = draft ?? record.value;
  const dirty = JSON.stringify(value) !== JSON.stringify(record.value);
  return {
    ...record, value, dirty, message,
    change(next: T) { setDraft(next); setMessage(""); },
    discard() { setDraft(null); setMessage(""); },
    commit() {
      if (!record.save(value)) return false;
      setDraft(null);
      setMessage("Saved in this browser. No organization settings were changed on a server.");
      return true;
    },
  };
}
