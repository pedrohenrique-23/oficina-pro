// src/app/orders/_components/order-form.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save, AlertTriangle } from "lucide-react"; // Importamos o AlertTriangle
import { createOrderAction } from "@/app/actions/order-actions";

interface OrderFormProps {
  clients: any[];
  products: any[];
}

export function OrderForm({ clients, products }: OrderFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState("");
  const [description, setDescription] = useState("");
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);

  const availableMotorcycles = useMemo(() => {
    const client = clients.find(c => c.id === selectedClientId);
    return client ? client.motorcycles : [];
  }, [selectedClientId, clients]);

  const totalValue = useMemo(() => {
    return orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }, [orderItems]);

  // Nova Lógica: Verifica se existe erro de estoque em algum item
  const hasStockError = useMemo(() => {
    return orderItems.some(item => {
      const product = products.find(p => p.id === item.productId);
      return product && item.quantity > product.stock;
    });
  }, [orderItems, products]);

  const addItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    if (field === "productId") {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value, unitPrice: product ? Number(product.price) : 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrderItems(newItems);
  };

  async function handleSubmit() {
    if (!selectedClientId || !selectedMotorcycleId || orderItems.length === 0 || hasStockError) return;

    setIsPending(true);
    const result = await createOrderAction({
      clientId: selectedClientId,
      motorcycleId: selectedMotorcycleId,
      description,
      items: orderItems,
    });
    setIsPending(false);

    if (result.success) {
      router.push("/orders");
      router.refresh();
    } else {
      alert(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <select className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={selectedClientId} onChange={(e) => { setSelectedClientId(e.target.value); setSelectedMotorcycleId(""); }}>
                <option value="">Selecione o cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Moto</Label>
              <select className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={selectedMotorcycleId} onChange={(e) => setSelectedMotorcycleId(e.target.value)} disabled={!selectedClientId}>
                <option value="">Selecione a moto...</option>
                {availableMotorcycles.map((m: any) => (<option key={m.id} value={m.id}>{m.brand} {m.model} ({m.plate})</option>))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descrição do Problema/Serviço</Label>
            <Input placeholder="Ex: Troca de óleo e revisão de freios" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Peças e Serviços</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2">
              <Plus className="w-4 h-4" /> Adicionar Item
            </Button>
          </div>

          {orderItems.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            const isInvalidQuantity = product && item.quantity > product.stock;

            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end border-b pb-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Produto</Label>
                  <select className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" value={item.productId} onChange={(e) => updateItem(index, "productId", e.target.value)}>
                    <option value="">Selecione a peça...</option>
                    {products.map(p => (<option key={p.id} value={p.id}>{p.name} (Disponível: {p.stock})</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className={isInvalidQuantity ? "text-red-500 font-bold" : ""}>
                    Qtd. {product && `(Máx: ${product.stock})`}
                  </Label>
                  <Input 
                    type="number" 
                    min="1" 
                    className={isInvalidQuantity ? "border-red-500 ring-red-500" : ""}
                    value={item.quantity} 
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} 
                  />
                  {isInvalidQuantity && (
                    <p className="text-[10px] text-red-600 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> ESTOQUE INSUFICIENTE
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeItem(index)}>
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            )
          })}

          <div className="flex justify-between items-center pt-4">
            <div className="text-2xl font-bold">Total: R$ {totalValue.toFixed(2)}</div>
            {/* Botão com trava de segurança */}
            <Button 
              onClick={handleSubmit} 
              disabled={isPending || hasStockError || orderItems.length === 0} 
              className={`gap-2 px-8 py-6 text-lg ${hasStockError ? "bg-red-600 hover:bg-red-700" : ""}`}
            >
              <Save className="w-5 h-5" />
              {hasStockError ? "Corrija o Estoque" : isPending ? "Salvando..." : "Finalizar O.S."}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}