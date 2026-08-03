"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { normalizePathzyError } from "@/lib/errors/error-normalization";
import { pathzyPhase2T, pathzyT } from "@/lib/language/pathzy-i18n";
import type { SupportedLanguageCode } from "@/lib/language/language-preferences";

export type ProfessionalIdentityAutosaveState = "idle" | "dirty" | "saving" | "still-saving" | "saved" | "retrying" | "error";
export type ProfessionalIdentitySaveMode = "autosave" | "navigation";

type ActiveSave = {
  controller: AbortController;
  promise: Promise<boolean>;
  signature: string;
};

type SaveStep = {
  key: string;
};

export function useProfessionalIdentityAutosave<TValues, TStep extends SaveStep>({
  activeStep,
  activeLanguage,
  buildPayload,
  debounceMs = 700
}: {
  activeStep: TStep | null;
  activeLanguage: SupportedLanguageCode;
  buildPayload: (step: TStep, values: TValues) => Record<string, unknown>;
  debounceMs?: number;
}) {
  const [autosaveState, setAutosaveState] = useState<ProfessionalIdentityAutosaveState>("idle");
  const [message, setMessage] = useState("");
  const hasHydrated = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slowSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSave = useRef(0);
  const activeSave = useRef<ActiveSave | null>(null);
  const lastPersistedSignature = useRef(new Map<string, string>());

  const clearScheduledSave = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
  }, []);

  const clearSlowSaveTimer = useCallback(() => {
    if (slowSaveTimer.current) {
      clearTimeout(slowSaveTimer.current);
      slowSaveTimer.current = null;
    }
  }, []);

  const logSaveMetric = useCallback((event: string, details: Record<string, string | number | boolean | null>) => {
    if (process.env.NODE_ENV !== "development") return;
    console.info("[professional-identity:save-performance]", { event, ...details });
  }, []);

  const persistStep = useCallback(async (step: TStep, nextValues: TValues, mode: ProfessionalIdentitySaveMode = "navigation") => {
    clearScheduledSave();
    const payload = buildPayload(step, nextValues);
    const signature = `${step.key}:${JSON.stringify(payload)}`;
    if (activeSave.current?.signature === signature) return activeSave.current.promise;
    if (lastPersistedSignature.current.get(step.key) === signature) {
      setAutosaveState("saved");
      setMessage("");
      return true;
    }

    activeSave.current?.controller.abort();
    const saveId = latestSave.current + 1;
    latestSave.current = saveId;
    setAutosaveState(mode === "autosave" ? "saving" : autosaveState === "error" ? "retrying" : "saving");
    setMessage("");
    const controller = new AbortController();
    const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    slowSaveTimer.current = setTimeout(() => {
      if (saveId === latestSave.current) {
        setAutosaveState("still-saving");
        setMessage(pathzyPhase2T(activeLanguage, "identity.save.continueWhenDone"));
      }
    }, 2000);

    const savePromise = (async () => {
      try {
        const response = await fetch("/api/professional-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: step.key, values: payload, mode }),
          signal: controller.signal
        });
        const data = await response.json().catch(() => ({}));
        const duration = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - startedAt);
        logSaveMetric("request_complete", {
          section: step.key,
          durationMs: duration,
          serverDurationMs: Number(response.headers.get("x-pathzy-profile-save-duration-ms") ?? 0),
          ok: response.ok,
          saveId
        });

        if (!response.ok) {
          if (saveId === latestSave.current) {
            clearSlowSaveTimer();
            setAutosaveState("error");
            setMessage(typeof data.error === "string" ? data.error : pathzyT(activeLanguage, "onboarding.save.error"));
          }
          return false;
        }

        if (saveId === latestSave.current) {
          clearSlowSaveTimer();
          lastPersistedSignature.current.set(step.key, signature);
          setAutosaveState("saved");
          setMessage("");
        }
        return true;
      } catch (caught) {
        if (controller.signal.aborted) return false;
        const normalized = normalizePathzyError(caught, pathzyT(activeLanguage, "onboarding.save.error"));
        console.warn("[professional-identity] Autosave failed", {
          code: normalized.code ?? "unknown",
          message: normalized.developerMessage,
          originalType: normalized.originalType
        });
        if (saveId === latestSave.current) {
          clearSlowSaveTimer();
          setAutosaveState("error");
          setMessage(normalized.userMessage);
        }
        return false;
      } finally {
        if (activeSave.current?.signature === signature) activeSave.current = null;
      }
    })();

    activeSave.current = { controller, promise: savePromise, signature };
    return savePromise;
  }, [activeLanguage, autosaveState, buildPayload, clearScheduledSave, clearSlowSaveTimer, logSaveMetric]);

  const scheduleAutosave = useCallback((nextValues: TValues, step = activeStep) => {
    if (!step) return;
    clearScheduledSave();
    const payload = buildPayload(step, nextValues);
    const signature = `${step.key}:${JSON.stringify(payload)}`;
    if (lastPersistedSignature.current.get(step.key) === signature) return;
    setAutosaveState("dirty");
    setMessage("");
    const scheduledAt = typeof performance !== "undefined" ? performance.now() : Date.now();
    saveTimer.current = setTimeout(() => {
      logSaveMetric("debounced_request_started", {
        section: step.key,
        delayMs: Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - scheduledAt)
      });
      void persistStep(step, nextValues, "autosave");
    }, debounceMs);
  }, [activeStep, buildPayload, clearScheduledSave, debounceMs, logSaveMetric, persistStep]);

  const persistOnboardingProgress = useCallback(async (state: string) => {
    setAutosaveState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/professional-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "onboarding_progress",
          values: { state }
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setAutosaveState("error");
        setMessage(typeof data.error === "string" ? data.error : pathzyT(activeLanguage, "onboarding.save.error"));
        return false;
      }
      setAutosaveState("saved");
      setMessage(pathzyT(activeLanguage, "onboarding.save.saved"));
      return true;
    } catch (caught) {
      const normalized = normalizePathzyError(caught, pathzyT(activeLanguage, "onboarding.save.error"));
      console.warn("[professional-identity] Onboarding progress save failed", {
        code: normalized.code ?? "unknown",
        message: normalized.developerMessage,
        originalType: normalized.originalType
      });
      setAutosaveState("error");
      setMessage(normalized.userMessage);
      return false;
    }
  }, [activeLanguage]);

  const retrySave = useCallback((values: TValues) => {
    if (!activeStep) return;
    setAutosaveState("retrying");
    void persistStep(activeStep, values);
  }, [activeStep, persistStep]);

  useEffect(() => {
    hasHydrated.current = true;
    return () => {
      clearScheduledSave();
      clearSlowSaveTimer();
      activeSave.current?.controller.abort();
    };
  }, [clearScheduledSave, clearSlowSaveTimer]);

  return {
    autosaveState,
    message,
    setMessage,
    hasHydrated,
    persistStep,
    scheduleAutosave,
    persistOnboardingProgress,
    retrySave
  };
}
