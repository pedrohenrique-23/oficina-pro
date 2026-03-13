import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, ShoppingCart, CreditCard } from "lucide-react";
import Link from "next/link";
import { PrintSaleButton } from "../_components/print-sale-button";

export default async function SaleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const saleRaw = await prisma.sale.findUnique({
    where: { id },
    include: {
      client: true,
      items: { include: { product: true } }
    }
  });

  if (!saleRaw) notFound();

  // Sanitização de dados para evitar erro de Decimal
  const sale = {
    ...saleRaw,
    totalValue: Number(saleRaw.totalValue),
    items: saleRaw.items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.quantity) * Number(item.unitPrice)
    }))
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {/* BARRA DE AÇÕES (Escondida na impressão) */}
      <div className="flex justify-between items-center print:hidden">
  <Button variant="ghost" asChild>
    <Link href="/sales/new"><ArrowLeft className="w-4 h-4 mr-2" /> Nova Venda</Link>
  </Button>
  
  {/* 🚀 Use o novo componente de cliente aqui */}
  <PrintSaleButton /> 
</div>

      {/* VISÃO DE TELA (Desktop) */}
      <Card className="print:hidden border-2">
        <CardHeader className="border-b text-center font-bold uppercase">
          Venda Confirmada! #{sale.number}
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground italic">Cliente:</span>
            <span className="font-bold">{sale.client?.name || "Consumidor Final"}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-blue-900 border-t pt-4">
            <span>TOTAL:</span>
            <span>R$ {sale.totalValue.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* 🚀 LAYOUT TÉRMICO (58mm) - Aparece APENAS na impressão */}
      <div className="hidden print:block w-[58mm] font-mono text-[9px] leading-tight text-black bg-white mx-auto p-1">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: 58mm auto; margin: 0; }
            body { margin: 0; padding: 0; background: white; }
          }
        `}} />

        <div className="text-center border-b border-dashed border-black pb-2 mb-2">
          <h2 className="font-bold text-xs uppercase">Oficina Pro</h2>
          <p className="text-[7px]">Venda de Balcão #{sale.number.toString().padStart(4, '0')}</p>
          <p>{new Date(sale.createdAt).toLocaleDateString('pt-BR')} {new Date(sale.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div className="mb-2 uppercase border-b border-dashed border-black pb-1">
          <p><strong>CLIENTE:</strong> {sale.client?.name || "CONSUMIDOR"}</p>
          <p><strong>PGTO:</strong> {sale.paymentMethod}</p>
        </div>

        <div className="font-bold uppercase text-[8px] mb-1">Itens da Venda</div>
        {sale.items.map(item => (
          <div key={item.id} className="flex justify-between items-start gap-1 mb-1">
            <span className="flex-1 truncate">{item.quantity}x {item.product.name}</span>
            <span className="font-bold">{item.subtotal.toFixed(2)}</span>
          </div>
        ))}

        <div className="border-t-2 border-black pt-1 mt-2 flex justify-between font-black text-[11px]">
          <span>TOTAL:</span>
          <span>R$ {sale.totalValue.toFixed(2)}</span>
        </div>

        <p className="text-center mt-6 text-[7px] italic border-t border-dotted border-black pt-2">
          Obrigado pela preferência!
        </p>
        <div className="h-10"></div>
      </div>
    </div>
  );
}