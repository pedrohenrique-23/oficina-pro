"use client";

import { useState } from "react";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "./product-form";

export function EditProductModal({ product }: { product: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit2 className="w-4 h-4 text-amber-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Produto: {product.name}</DialogTitle>
        </DialogHeader>
        {/* Passamos os dados iniciais para o formulário entrar em modo de edição */}
        <ProductForm initialData={product} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}