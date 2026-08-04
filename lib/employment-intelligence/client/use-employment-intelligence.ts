"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchEmploymentIntelligenceDetail, fetchEmploymentIntelligenceSummary, requestEmploymentIntelligenceRecompute, retryEmploymentIntelligence } from "./employment-intelligence-client";
import { safeEmploymentIntelligenceClientError, type EmploymentIntelligenceClientError } from "./employment-intelligence-errors";

export function useEmploymentIntelligence<T>(options: { detail?: boolean; version?: string | number | null } = {}) {
  const mounted = useRef(true);
  const [data, setData] = useState<T | null>(null);
  const [previousValidData, setPreviousValidData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<EmploymentIntelligenceClientError | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextData = options.detail ? await fetchEmploymentIntelligenceDetail<T>() : await fetchEmploymentIntelligenceSummary<T>();
      if (!mounted.current) return;
      setData(nextData);
      setPreviousValidData(nextData);
    } catch (nextError) {
      if (!mounted.current) return;
      setError(safeEmploymentIntelligenceClientError(nextError));
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [options.detail]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
      setData(null);
      setPreviousValidData(null);
    };
  }, [load, options.version]);

  const recompute = useCallback(async () => {
    setUpdating(true);
    setError(null);
    try {
      const result = await requestEmploymentIntelligenceRecompute<T>();
      if (!mounted.current) return null;
      setData(result);
      setPreviousValidData(result);
      return result;
    } catch (nextError) {
      if (mounted.current) setError(safeEmploymentIntelligenceClientError(nextError));
      return null;
    } finally {
      if (mounted.current) setUpdating(false);
    }
  }, []);

  const retry = useCallback(async () => {
    setUpdating(true);
    setError(null);
    try {
      const result = await retryEmploymentIntelligence<T>();
      if (!mounted.current) return null;
      setData(result);
      setPreviousValidData(result);
      return result;
    } catch (nextError) {
      if (mounted.current) setError(safeEmploymentIntelligenceClientError(nextError));
      return null;
    } finally {
      if (mounted.current) setUpdating(false);
    }
  }, []);

  return { data: data ?? previousValidData, loading, updating, error, reload: load, recompute, retry };
}
