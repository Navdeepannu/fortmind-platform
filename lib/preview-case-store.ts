"use client";

import { useSyncExternalStore } from "react";
import type { SecurityCase } from "./preview-data";

// Draft fixtures stay in this browser tab so their deep links survive refresh.
const storageKey = "fortmind.prototype-cases.v1";
const empty: SecurityCase[] = [];
let created: SecurityCase[] = empty;
let initialized = false;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  initialize();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const snapshot = () => created;
const serverSnapshot = () => empty;
export function usePreviewCases() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
export function usePreviewCasesReady() {
  return useSyncExternalStore(subscribe, () => initialized, () => false);
}
function makeDraft(id: string, title: string, context: string): SecurityCase {
  return {
    id,
    title: title.trim(),
    summary: context.trim(),
    priority: "Notable",
    verdict: "Inconclusive",
    status: "Queued",
    owner: null,
    source: "Created by an analyst",
    ageMinutes: 0,
    confidence: { value: 0, level: "Low" },
    entities: {
      hostname: "Not supplied",
      ip: "Not supplied",
      user: "Not supplied",
    },
  };
}
function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(saved)) return;
    const ids = new Set<string>();
    created = saved.flatMap(value => {
      if (!value || typeof value !== "object" || typeof value.id !== "string" ||
        !/^FM-LOCAL-\d+$/.test(value.id) || ids.has(value.id) ||
        typeof value.title !== "string" || !value.title.trim() || value.title.length > 160 ||
        typeof value.context !== "string") return [];
      const sequence = Number(value.id.slice(9));
      if (!Number.isSafeInteger(sequence) || sequence < 1) return [];
      ids.add(value.id);
      return [makeDraft(value.id, value.title, value.context)];
    });
  } catch {
    // A disabled or full browser store leaves the existing in-memory prototype usable.
  }
}
export function addPreviewCase(title: string, context: string) {
  initialize();
  const nextId = Math.max(0, ...created.map(item => Number(item.id.slice(9)))) + 1;
  const item = makeDraft(`FM-LOCAL-${String(nextId).padStart(3, "0")}`, title, context);
  created = [item, ...created];
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(created.map(item => ({ id: item.id, title: item.title, context: item.summary }))));
  } catch {
    // Keep the case available in memory if browser persistence is unavailable.
  }
  listeners.forEach((listener) => listener());
  return item;
}
