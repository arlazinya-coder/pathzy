"use client";

import { useEmploymentIntelligence } from "./use-employment-intelligence";

export function useCareerPlan<T>() {
  return useEmploymentIntelligence<T>({ detail: true });
}
