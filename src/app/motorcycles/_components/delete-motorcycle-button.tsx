"use client"; //

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMotorcycleAction } from "@/app/actions/motorcycle-actions";

export function DeleteMotorcycleButton({ id, plate }: { id: string, plate: string }) {
  const handleDelete = async () => {
    // Agora o confirm funciona pois este componente é 'use client'
    if (confirm(`Deseja realmente excluir a moto de placa ${plate}?`)) {
      const result = await deleteMotorcycleAction(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-red-500 hover:text-red-700"
      onClick={handleDelete}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}