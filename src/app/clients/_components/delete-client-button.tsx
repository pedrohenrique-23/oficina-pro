"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteClientAction } from "@/app/actions/client-actions";

export function DeleteClientButton({ id, name }: { id: string, name: string }) {
  const handleDelete = async () => {
    if (confirm(`Deseja realmente excluir o cliente "${name}"?`)) {
      const result = await deleteClientAction(id);
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