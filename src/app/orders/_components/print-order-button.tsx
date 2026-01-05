"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintOrderButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      variant="default" 
      className="gap-2 bg-slate-800"
    >
      <Printer className="w-4 h-4" />
      Imprimir Recibo
    </Button>
  );
}