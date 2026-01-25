"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, Wrench, Package } from "lucide-react";
import { createOrderAction, updateOrderAction } from "@/app/actions/order-actions";

interface OrderFormProps {
  clients: any[];
  products: any[];
  initialData?: any; 
}

export function OrderForm({ clients, products, initialData }: OrderFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState(initialData?.clientId || "");
  const [selectedMotorcycleId, setSelectedMotorcycleId] = useState(initialData?.motorcycleId || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const [services, setServices] = useState<{ description: string; price: number }[]>(
    initialData?.services?.map((s: any) => ({
      description: s.description,
      price: Number(s.price)
    })) || [{ description: "", price: 0 }]
  );

  const [orderItems, setOrderItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>(
    initialData?.items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice)
    })) || []
  );

  const totalValue = useMemo(() => {
    const itemsSum = orderItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const servicesSum = services.reduce((acc, service) => acc + service.price, 0);
    return itemsSum + servicesSum;
  }, [orderItems, services]);

  const availableMotorcycles = useMemo(() => {
    const client = clients.find(c => c.id === selectedClientId);
    return client ? client.motorcycles : [];
  }, [selectedClientId, clients]);

  const handleAddService = () => setServices([...services, { description: "", price: 0 }]);
  
  const handleRemoveService = (index: number) => {
    const newServices = services.filter((_, i) => i !== index);
    setServices(newServices);
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const newServices = [...services];
    (newServices[index] as any)[field] = field === "price" ? Number(value) : value;
    setServices(newServices);
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...orderItems];
    if (field === "productId") {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value, unitPrice: Number(product?.price || 0) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setOrderItems(newItems);
  };

  async function handleSubmit() {
    if (!selectedClientId || !selectedMotorcycleId) {
      alert("Por favor, selecione o cliente e a moto.");
      return;
    }

    setIsPending(true);
    
    const payload = { 
      clientId: selectedClientId, 
      motorcycleId: selectedMotorcycleId, 
      description, 
      services,
      items: orderItems 
    };

    const action = initialData 
      ? updateOrderAction(initialData.id, payload)
      : createOrderAction(payload);

    const result = await action;
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
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Motocicleta</Label>
              <Select value={selectedMotorcycleId} onValueChange={setSelectedMotorcycleId} disabled={!selectedClientId}>
                <SelectTrigger><SelectValue placeholder="Selecione a moto" /></SelectTrigger>
                <SelectContent>
                  {availableMotorcycles.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>{m.brand} {m.model} ({m.plate})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações Gerais</Label>
            <Input 
              placeholder="Notas adicionais sobre a ordem..." 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100 shadow-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2 text-blue-900"><Wrench className="w-5 h-5" /> Serviços Realizados</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddService} className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Serviço
            </Button>
          </div>

          <div className="space-y-3">
            {services.map((service, index) => (
              <div key={index} className="flex gap-4 items-end bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-blue-800">Descrição da Mão de Obra</Label>
                  <Input 
                    placeholder="Ex: Revisão Geral" 
                    className="bg-white"
                    value={service.description} 
                    onChange={(e) => handleServiceChange(index, "description", e.target.value)} 
                  />
                </div>
                <div className="w-32 space-y-1">
                  <Label className="text-xs text-blue-800">Valor (R$)</Label>
                  <Input 
                    type="number" 
                    step="0.01"
                    className="bg-white font-bold"
                    value={service.price} 
                    onChange={(e) => handleServiceChange(index, "price", e.target.value)} 
                  />
                </div>
                {services.length > 1 && (
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600" onClick={() => handleRemoveService(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2"><Package className="w-5 h-5" /> Peças Utilizadas</h2>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar Peça
            </Button>
          </div>

          <div className="space-y-3">
            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end bg-slate-50 p-3 rounded-md border">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Peça</Label>
                  <Select value={item.productId} onValueChange={(val:string) => handleItemChange(index, "productId", val)}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione a peça" /></SelectTrigger>
                    <SelectContent>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (R$ {Number(p.price).toFixed(2)})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Qtd</Label>
                  <Input 
                    type="number" 
                    className="bg-white" 
                    value={item.quantity} 
                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))} 
                  />
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleRemoveItem(index)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-black tracking-widest">Total Geral</span>
              <span className="text-4xl font-black text-blue-900 font-mono">R$ {totalValue.toFixed(2)}</span>
            </div>
            <Button onClick={handleSubmit} disabled={isPending} className="px-10 py-6 text-lg font-bold bg-slate-900 hover:bg-slate-800">
              <Save className="w-5 h-5 mr-2" /> {initialData ? "Salvar Alterações" : "Gerar Ordem de Serviço"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}