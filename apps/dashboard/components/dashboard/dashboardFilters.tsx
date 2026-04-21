"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { X } from "lucide-react";
import type { Route } from "next";

export type FilterDefinition = {
  key: string;
  type: "select" | "date_range" | "string" | "number_range";
  label?: string | null;
  options?: string[];
};

type Props = {
  filters: FilterDefinition[];
  currentValues: Record<string, string | undefined>;
};

export default function DashboardFilters({ filters, currentValues }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const f of filters) {
      params.delete(f.key);
      params.delete(`${f.key}_from`);
      params.delete(`${f.key}_to`);
    }
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
  }, [router, pathname, searchParams, filters]);

  const hasAnyActive = filters.some((f) => {
    if (f.type === "date_range") {
      return currentValues[`${f.key}_from`] || currentValues[`${f.key}_to`];
    }
    if (f.type === "number_range") {
      return currentValues[`${f.key}_from`] || currentValues[`${f.key}_to`];
    }
    return !!currentValues[f.key];
  });

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-end gap-3">
      {filters.map((filter) => {
        const label = filter.label ?? filter.key;

        if (filter.type === "select") {
          return (
            <div key={filter.key} className="flex flex-col gap-1 min-w-32">
              <Label htmlFor={`filter-${filter.key}`} className="text-xs">
                {label}
              </Label>
              <NativeSelect
                id={`filter-${filter.key}`}
                value={currentValues[filter.key] ?? ""}
                onChange={(e) => updateParam(filter.key, e.target.value || null)}
                className="h-8 text-sm"
              >
                <NativeSelectOption value="">All</NativeSelectOption>
                {(filter.options ?? []).map((opt) => (
                  <NativeSelectOption key={opt} value={opt}>
                    {opt}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>
          );
        }

        if (filter.type === "string") {
          return (
            <div key={filter.key} className="flex flex-col gap-1 min-w-40">
              <Label htmlFor={`filter-${filter.key}`} className="text-xs">
                {label}
              </Label>
              <Input
                id={`filter-${filter.key}`}
                value={currentValues[filter.key] ?? ""}
                onChange={(e) => updateParam(filter.key, e.target.value || null)}
                placeholder={label}
                className="h-8 text-sm"
              />
            </div>
          );
        }

        if (filter.type === "date_range") {
          const fromKey = `${filter.key}_from`;
          const toKey = `${filter.key}_to`;
          return (
            <div key={filter.key} className="flex flex-col gap-1">
              <Label className="text-xs">{label}</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="date"
                  value={currentValues[fromKey] ?? ""}
                  onChange={(e) => updateParam(fromKey, e.target.value || null)}
                  className="h-8 text-sm w-36"
                  aria-label={`${label} from`}
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="date"
                  value={currentValues[toKey] ?? ""}
                  onChange={(e) => updateParam(toKey, e.target.value || null)}
                  className="h-8 text-sm w-36"
                  aria-label={`${label} to`}
                />
              </div>
            </div>
          );
        }

        if (filter.type === "number_range") {
          const fromKey = `${filter.key}_from`;
          const toKey = `${filter.key}_to`;
          return (
            <div key={filter.key} className="flex flex-col gap-1">
              <Label className="text-xs">{label}</Label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={currentValues[fromKey] ?? ""}
                  onChange={(e) => updateParam(fromKey, e.target.value || null)}
                  placeholder="Min"
                  className="h-8 text-sm w-24"
                  aria-label={`${label} min`}
                />
                <span className="text-muted-foreground text-xs">–</span>
                <Input
                  type="number"
                  value={currentValues[toKey] ?? ""}
                  onChange={(e) => updateParam(toKey, e.target.value || null)}
                  placeholder="Max"
                  className="h-8 text-sm w-24"
                  aria-label={`${label} max`}
                />
              </div>
            </div>
          );
        }

        return null;
      })}

      {hasAnyActive && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-8 gap-1 text-muted-foreground"
        >
          <X className="size-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
