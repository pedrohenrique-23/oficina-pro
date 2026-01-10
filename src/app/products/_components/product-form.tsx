"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import { createProductAction, updateProductAction } from "@/app/actions/product-actions";

interface ProductFormProps {
  initialData?: any;
  onSuccess?: () => void; // Função para fechar o modal
}

export function ProductForm({ initialData, onSuccess }: ProductFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    price: initialData?.price ? Number(initialData.price) : 0,
    costPrice: initialData?.costPrice ? Number(initialData.costPrice) : 0,
    stock: initialData?.stock || 0,
    minStock: initialData?.minStock || 2,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);

    const result = initialData 
      ? await updateProductAction(initialData.id, formData)
      : await createProductAction(formData);

    setIsPending(false);

    if (result.success) {
      toast.success(initialData ? "Produto atualizado!" : "Produto cadastrado!");
      if (onSuccess) onSuccess(); // Fecha o modal
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>SKU</Label>
          <Input name="sku" value={formData.sku} onChange={handleChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea name="description" value={formData.description} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Preço de Custo</Label>
          <Input name="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Preço de Venda</Label>
          <Input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estoque</Label>
          <Input name="stock" type="number" value={formData.stock} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label>Estoque Mínimo</Label>
          <Input name="minStock" type="number" value={formData.minStock} onChange={handleChange} required />
        </div>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isPending}>
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {initialData ? "Salvar Alterações" : "Cadastrar Produto"}
      </Button>
    </form>
  );
}