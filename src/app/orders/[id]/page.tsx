import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bike, User, Wrench, Package, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { PrintOrderButton } from "../_components/print-order-button";
import { FinishOrderButton } from "../_components/finish-order-button";

interface OrderDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsProps) {
  const { id } = await params;

  const orderRaw = await prisma.orderService.findUnique({
    where: { id },
    include: {
      client: true, motorcycle: true, services: true, 
      items: { include: { product: true } }
    }
  });

  if (!orderRaw) notFound();

  const order = {
    ...orderRaw,
    totalValue: Number(orderRaw.totalValue),
    laborValue: Number(orderRaw.laborValue),
    services: orderRaw.services.map(s => ({ ...s, price: Number(s.price) })),
    items: orderRaw.items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.quantity) * Number(item.unitPrice)
    }))
  };

  const totalParts = order.totalValue - order.laborValue;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* 🖥️ VISÃO DE TELA (Desktop) */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/orders">
            {/* ✅ FIX: Envolvido em span para ser um filho único do Link/Button */}
            <span className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </span>
          </Link>
        </Button>
        <div className="flex gap-2">
          {order.status !== 'FINISHED' && (
            <FinishOrderButton id={order.id} orderNumber={order.number.toString()} />
          )}
          <PrintOrderButton />
        </div>
      </div>

      <Card className="border-2 shadow-none print:hidden text-slate-900">
        <CardHeader className="border-b text-center">
            {/* ✅ FIX: Envolvido em div para o CardHeader receber apenas um filho */}
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter">Oficina Pro</h1>
              <p className="text-xs text-muted-foreground italic">O.S. #{order.number.toString().padStart(4, '0')}</p>
            </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Cliente</p>
              <p className="font-semibold">{order.client.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">Moto</p>
              <p className="font-semibold">{order.motorcycle.brand} {order.motorcycle.model} ({order.motorcycle.plate})</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase text-muted-foreground">Serviços</p>
            <Table>
              <TableBody>
                {order.services.map(s => (
                  <TableRow key={s.id}>
                    <TableCell>{s.description}</TableCell>
                    <TableCell className="text-right font-bold">R$ {s.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-right border-t pt-4">
            <p className="text-4xl font-black text-blue-900 italic">R$ {order.totalValue.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================================
          🚀 VISÃO TÉRMICA (384px + Logomarca + Correção de Altura)
          ========================================================== */}
      <div className="hidden print:block font-mono text-black bg-white mx-auto">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: 58mm auto; margin: 0 !important; }
            html, body {
              width: 58mm !important;
              margin: 0 !important; padding: 0 !important;
              height: auto !important; /* ✅ FIX: Impede o papel infinito */
              overflow: visible !important;
            }
            body { display: block; background: white !important; }
          }
        `}} />

        <div className="w-[384px] p-2 bg-white flex flex-col items-center">
          
          <div className="mb-2">
             <img src="/logo.png" alt="Logo" className="w-[220px] grayscale contrast-125" />
          </div>

          <div className="w-full text-center border-b-2 border-black pb-2 mb-4">
            <h2 className="font-bold text-[28px] uppercase leading-none">Oficina Pro</h2>
            <div className="font-bold text-[22px] mt-2 border-y-2 border-black py-1">
               O.S. #{order.number.toString().padStart(4, '0')}
            </div>
            <p className="text-[14px] mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div className="w-full mb-4 uppercase text-[18px] space-y-1 border-b border-dashed border-black pb-2">
            <p><strong>CLI:</strong> {order.client.name.split(' ')[0]}</p>
            <p><strong>PLACA:</strong> {order.motorcycle.plate.toUpperCase()}</p>
          </div>

          <div className="w-full space-y-2 border-b-2 border-black pb-2">
            {order.services.map(s => (
              <div key={s.id} className="flex justify-between items-start gap-1 text-[16px]">
                <span className="flex-1 break-words leading-tight">{s.description}</span>
                <span className="font-bold">R${s.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="w-full pt-2 mt-4">
            <div className="flex justify-between font-black text-[30px]">
              <span>TOTAL:</span>
              <span>R$ {order.totalValue.toFixed(2)}</span>
            </div>
          </div>

          <div className="w-full mt-12 text-center border-t border-black pt-2">
            <p className="text-[16px] font-bold uppercase text-black">Assinatura</p>
          </div>

          <p className="text-center mt-6 text-[14px] italic border-t border-dotted border-black pt-2">
            Obrigado pela preferência!
          </p>
          
          <div className="h-2 overflow-hidden">.</div>
        </div>
      </div>
    </div>
  );
}