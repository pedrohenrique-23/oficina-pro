"use client"; // 🚀 Essencial para usar o onClick

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintSaleButton() {
  return (
    <Button 
      onClick={() => window.print()} 
      className="gap-2 bg-blue-600 hover:bg-blue-700 print:hidden"
    >
      <Printer className="w-4 h-4" /> Imprimir Recibo
    </Button>
  );
}