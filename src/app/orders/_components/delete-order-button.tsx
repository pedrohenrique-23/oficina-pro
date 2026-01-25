"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/app/actions/order-actions";

export function DeleteOrderButton({ id, orderNumber }: { id: string, orderNumber: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a O.S. #${orderNumber.toString().padStart(4, "0")}? Esta ação não pode ser desfeita e as peças voltarão ao estoque.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteOrderAction(id);
    
    // 🛠️ Ajuste para satisfazer o TypeScript:
    if (result.success === false) {
      // Como o sucesso é falso, o TS agora permite acessar o .error com segurança
      alert(result.error);
    }
    
    setIsDeleting(false);
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={isDeleting}
      onClick={handleDelete}
      className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}