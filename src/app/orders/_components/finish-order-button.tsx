"use client";

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { finishOrderAction } from "@/app/actions/order-actions"; 

interface FinishOrderButtonProps {
  id: string;
  orderNumber: string;
}

export function FinishOrderButton({ id, orderNumber }: FinishOrderButtonProps) {
  const handleFinish = async () => {
    if (confirm(`Confirmar finalização da O.S. #${orderNumber}? Isso impedirá futuras alterações de peças.`)) {
      const result = await finishOrderAction(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  return (
    <Button 
      onClick={handleFinish} 
      variant="outline" 
      size="sm"
      className="text-green-600 border-green-600 hover:bg-green-50 gap-2"
    >
      <CheckCircle2 className="w-4 h-4" />
      Finalizar
    </Button>
  );
}