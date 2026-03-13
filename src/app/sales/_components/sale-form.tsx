"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ShoppingCart, Loader2, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSaleAction } from "@/app/actions/sale-actions";

interface SaleFormProps {
  products: any[]; // Removida a necessidade de receber 'clients' [cite: 2026-01-24]
}

export function SaleForm({ products }: SaleFormProps) {
  const router = useRouter();
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [barcode, setBarcode] = useState("");
  const [items, setItems] = useState<{ productId: string; quantity: number; unitPrice: number }[]>([]);

  // 🧮 Cálculo do Total Geral:
  // $$Total = \sum_{i=1}^{n} (Quantity_i \times UnitPrice_i)$$
  const totalValue = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  }, [items]);

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const product = products.find((p) => p.sku === barcode);

      if (product) {
        if (product.stock <= 0) {
          alert(`O produto "${product.name}" está sem estoque!`);
        } else {
          const existingItemIndex = items.findIndex(item => item.productId === product.id);
          if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += 1;
            setItems(newItems);
          } else {
            setItems([...items, { productId: product.id, quantity: 1, unitPrice: product.price }]);
          }
        }
        setBarcode("");
      } else {
        alert("Produto não encontrado.");
        setBarcode("");
      }
    }
  };

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      newItems[index] = { ...newItems[index], productId: value, unitPrice: product?.price || 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  async function onSubmit() {
  if (items.length === 0) return alert("Adicione itens!");

  setIsSubmitting(true);
  const result = await createSaleAction({
    paymentMethod: paymentMethod as any,
    items,
  });

  if (result.success) {
    // 🚀 Redireciona para a página do recibo que acabamos de criar
    router.push(`/sales/${result.saleId}`); 
    router.refresh();
  } else {
    alert(result.error);
  }
  setIsSubmitting(false);
}

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase flex items-center gap-2 text-blue-700">
                <ScanBarcode className="w-4 h-4" /> Leitura Rápida (Código de Barras / SKU)
              </label>
              <Input
                ref={barcodeInputRef}
                placeholder="Escaneie o código aqui..."
                className="bg-white border-blue-300 focus-visible:ring-blue-500"
                value={barcode}
                autoFocus
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={handleBarcodeScan}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold uppercase text-sm flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Itens da Venda
              </h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" /> Seleção Manual
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end border-b pb-4 last:border-0">
                <div className="flex-1">
                  <label className="text-xs font-bold uppercase mb-1 block">Produto</label>
                  <select
                    className="w-full border rounded-md p-2 bg-white"
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Estoque: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-24">
                  <label className="text-xs font-bold uppercase mb-1 block">Qtd</label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", Number(e.target.value))}
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs font-bold uppercase mb-1 block">Subtotal</label>
                  <div className="p-2 bg-muted rounded-md text-sm font-bold text-right">
                    R$ {(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="bg-slate-50 border-2 sticky top-6">
          <CardContent className="pt-6 space-y-4">
            {/* Bloco de cliente removido para venda anônima [cite: 2026-01-24] */}
            <div>
              <label className="text-xs font-bold uppercase mb-1 block">Forma de Pagamento</label>
              <select
                className="w-full border rounded-md p-2 bg-white"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="CASH">Dinheiro</option>
                <option value="PIX">PIX</option>
                <option value="DEBIT">Cartão de Débito</option>
                <option value="CREDIT">Cartão de Crédito</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-bold uppercase text-slate-500">Valor Total</p>
              <p className="text-4xl font-black text-blue-900 tracking-tight">
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold uppercase tracking-wider" 
              onClick={onSubmit} 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Finalizar Venda"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}