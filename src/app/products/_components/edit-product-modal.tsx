"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { updateProductAction } from "@/app/actions/product-actions";

export function EditProductModal({ product }: { product: any }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await updateProductAction(product.id, formData);
    setIsPending(false);

    if (result.success) setOpen(false);
    else alert(result.error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-blue-600">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Peça: {product.name}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Nome da Peça</Label>
            <Input id="name" name="name" defaultValue={product.name} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="sku">SKU / Código</Label>
              <Input id="sku" name="sku" defaultValue={product.sku || ""} />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="price">Preço de Venda (R$)</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={Number(product.price)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="stock">Qtd. em Estoque</Label>
              <Input id="stock" name="stock" type="number" defaultValue={product.stock} required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="minStock">Estoque Mínimo</Label>
              <Input id="minStock" name="minStock" type="number" defaultValue={product.minStock} required />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Salvando..." : "Atualizar Produto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}