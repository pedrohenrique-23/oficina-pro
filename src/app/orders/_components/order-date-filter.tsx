"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarSearch, X } from "lucide-react";

export function OrderDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleFilter(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const from = formData.get("from") as string;
    const to = formData.get("to") as string;

    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set("from", from); else params.delete("from");
    if (to) params.set("to", to); else params.delete("to");
    
    router.push(`/orders?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`/orders?${params.toString()}`);
  }

  return (
    <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
      <div className="space-y-1">
        <Label className="text-xs font-bold uppercase text-slate-500">Início</Label>
        <Input name="from" type="date" defaultValue={searchParams.get("from") || ""} className="bg-white" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-bold uppercase text-slate-500">Fim</Label>
        <Input name="to" type="date" defaultValue={searchParams.get("to") || ""} className="bg-white" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" className="gap-2 font-bold">
          <CalendarSearch className="w-4 h-4" /> Filtrar
        </Button>
        {(searchParams.get("from") || searchParams.get("to")) && (
          <Button type="button" variant="ghost" onClick={clearFilters} className="text-slate-500">
            <X className="w-4 h-4" /> Limpar
          </Button>
        )}
      </div>
    </form>
  );
}