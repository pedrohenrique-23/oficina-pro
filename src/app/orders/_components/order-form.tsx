// src/app/orders/_components/order-form.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Save, Wrench } from "lucide-react";
import { createOrderAction } from "@/app/actions/order-actions";

export function OrderForm({ clients, products }: { clients: any[], products: any[] }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState("");
  const [description, setDescription] = useState("");
  const [laborValue, setLaborValue] = useState(0); // Novo estado
  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);

  // Cálculo do Total Dinâmico
  const totalValue = useMemo(() => {
    const itemsSum = orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    return itemsSum + laborValue;
  }, [orderItems, laborValue]);

  const availableMotorcycles = useMemo(() => {
    const client = clients.find(c => c.id === selectedClientId);
    return client ? client.motorcycles : [];
  }, [selectedClientId, clients]);

  async function handleSubmit() {
    if (!selectedClientId || !selectedMotorcycleId) {
      alert("Selecione o cliente e a moto.");
      return;
    }

    setIsPending(true);
    const result = await createOrderAction({
      clientId: selectedClientId,
      motorcycleId: selectedMotorcycleId,
      description,
      laborValue,
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
             {/* ... seletores de cliente e moto permanecem iguais ... */}
          </div>

          <div className="space-y-2">
            <Label>Descrição do Problema/Serviço</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* Novo Campo: Valor da Mão de Obra */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-full text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <Label className="text-blue-900 font-bold">Valor da Mão de Obra (Trabalho)</Label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Ex: 50.00" 
                className="bg-white"
                value={laborValue}
                onChange={(e) => setLaborValue(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-700">Peças Utilizadas (Opcional)</h2>
            <Button type="button" variant="outline" size="sm" onClick={() => setOrderItems([...orderItems, { productId: "", quantity: 1, unitPrice: 0 }])}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Peça
            </Button>
          </div>

          {/* ... mapeamento das peças (orderItems.map) permanece igual ... */}

          <div className="flex justify-between items-center pt-6 border-t">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Total da O.S.</span>
              <span className="text-4xl font-black text-blue-900">R$ {totalValue.toFixed(2)}</span>
            </div>
            <Button onClick={handleSubmit} disabled={isPending} className="px-10 py-6 text-lg">
              <Save className="w-5 h-5 mr-2" /> Finalizar O.S.
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}