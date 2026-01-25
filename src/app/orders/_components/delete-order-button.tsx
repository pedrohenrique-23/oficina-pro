"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/app/actions/order-actions";

export function DeleteOrderButton({ id, orderNumber }: { id: string, orderNumber: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    // 1. Confirmação simples para evitar exclusão acidental [cite: 2026-01-24]
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a O.S. #${orderNumber.toString().padStart(4, "0")}? \n\nEsta ação não pode ser desfeita e as peças voltarão ao estoque.`
    );
    
    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      const result = await deleteOrderAction(id);
      
      // 🚀 A MÁGICA DO TYPESCRIPT: Narrowing [cite: 2026-01-24]
      // Ao verificar explicitamente se success é 'false', o TS entende que 
      // o objeto 'result' obrigatoriamente contém a propriedade 'error'.
      if (result.success === false) {
        alert(`Erro: ${result.error}`);
      }
    } catch (err) {
      alert("Ocorreu um erro inesperado ao tentar excluir a ordem.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={isDeleting}
      onClick={handleDelete}
      title="Excluir Ordem de Serviço"
      className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 className={`w-4 h-4 ${isDeleting ? "animate-pulse" : ""}`} />
    </Button>
  );
}