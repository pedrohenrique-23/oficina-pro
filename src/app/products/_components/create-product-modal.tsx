// src/app/products/_components/create-product-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { createProductAction } from "@/app/actions/product-actions";

export function CreateProductModal() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    const result = await createProductAction(formData);
    if (result.success) {
      setOpen(false); // Fecha o modal ao salvar com sucesso
    } else {
      alert(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-lg py-6 px-6">
          <PlusCircle className="w-6 h-6" />
          Cadastrar Nova Peça
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Nome da Peça</Label>
            <Input id="name" name="name" placeholder="Ex: Pneu Traseiro CG 160" required />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="sku">Código de Barras (SKU)</Label>
            <Input id="sku" name="sku" placeholder="Pressione o leitor ou digite" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="price">Preço de Venda</Label>
              <Input id="price" name="price" type="number" step="0.01" required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="costPrice">Preço de Custo</Label>
              <Input id="costPrice" name="costPrice" type="number" step="0.01" required />
            </div>
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="stock">Quantidade Inicial</Label>
            <Input id="stock" name="stock" type="number" required />
          </div>
          <Button type="submit" className="w-full text-lg py-6">Salvar no Estoque</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}