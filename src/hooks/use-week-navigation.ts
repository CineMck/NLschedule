"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { startOfWeek, addWeeks, subWeeks, format, parseISO } from "date-fns";
import { useCallback, useMemo } from "react";

export function useWeekNavigation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const weekStart = useMemo(() => {
    const weekParam = searchParams.get("week");
    if (weekParam) {
      try {
        return startOfWeek(parseISO(weekParam), { weekStartsOn: 0 });
      } catch {
        return startOfWeek(new Date(), { weekStartsOn: 0 });
      }
    }
    return startOfWeek(new Date(), { weekStartsOn: 0 });
  }, [searchParams]);

  const navigateWeek = useCallback(
    (date: Date) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("week", format(date, "yyyy-MM-dd"));
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const goToPreviousWeek = useCallback(() => {
    navigateWeek(subWeeks(weekStart, 1));
  }, [weekStart, navigateWeek]);

  const goToNextWeek = useCallback(() => {
    navigateWeek(addWeeks(weekStart, 1));
  }, [weekStart, navigateWeek]);

  const goToToday = useCallback(() => {
    navigateWeek(startOfWeek(new Date(), { weekStartsOn: 0 }));
  }, [navigateWeek]);

  return { weekStart, goToPreviousWeek, goToNextWeek, goToToday };
}
