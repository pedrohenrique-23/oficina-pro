import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bike, User, ClipboardCheck, Wrench, Package } from "lucide-react";
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
      client: true,
      motorcycle: true,
      services: true, 
      items: {
        include: { product: true }
      }
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
            <ArrowLeft className="w-4 h-4" /> Voltar
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
        <CardHeader className="border-b text-center space-y-2">
          <div className="flex justify-between items-start text-left">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter">Oficina Pro</h1>
              <p className="text-xs text-muted-foreground italic">Especialistas em Duas Rodas</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold text-blue-900 italic">
                O.S. #{order.number.toString().padStart(4, '0')}
              </div>
              <p className="text-xs font-bold text-slate-700">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" /> Cliente
              </h3>
              <p className="font-semibold">{order.client.name}</p>
              <p className="text-sm">{order.client.phone}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                <Bike className="w-4 h-4" /> Veículo
              </h3>
              <p className="font-semibold">{order.motorcycle.brand} {order.motorcycle.model}</p>
              <p className="text-sm font-mono uppercase bg-slate-100 px-2 py-0.5 rounded inline-block italic font-bold">
                Placa: {order.motorcycle.plate}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Serviços</h3>
            <Table className="border font-bold">
              <TableBody>
                {order.services.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.description}</TableCell>
                    <TableCell className="text-right italic">R$ {s.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-muted-foreground">Peças</h3>
            <Table className="border">
              <TableBody>
                {order.items.length === 0 ? (
                  <TableRow><TableCell className="text-center italic py-4">Nenhuma peça.</TableCell></TableRow>
                ) : (
                  order.items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.product.name} ({i.quantity}x)</TableCell>
                      <TableCell className="text-right font-bold text-blue-700 italic">R$ {i.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-right pt-4 border-t-2 border-double">
            <p className="text-xs font-bold uppercase text-muted-foreground">Valor Total</p>
            <p className="text-4xl font-black text-blue-900 tracking-tighter">R$ {order.totalValue.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================================
          🚀 VISÃO TÉRMICA CORRIGIDA (Sem espaço branco extra)
          ========================================================== */}
      <div className="hidden print:block font-mono text-black bg-white mx-auto">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { 
              size: 58mm auto; 
              margin: 0 !important; 
            }
            html, body {
              width: 58mm !important;
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
              overflow: visible !important;
            }
            body {
              display: block;
              /* Zoom reduzido para 1.5 e fontes fixas para maior controle */
              zoom: 1.5 !important; 
              width: 100% !important;
            }
            /* Remove espaços fantasmas de elementos ocultos */
            .print-hidden { display: none !important; }
          }
        `}} />

        <div className="w-full py-2 px-1" style={{ marginBottom: '0', paddingBottom: '0' }}>
          <div className="text-center border-b-2 border-black pb-1 mb-2">
            <h2 className="font-bold text-[18px] uppercase">Oficina Pro</h2>
            <div className="font-bold text-[14px] mt-1 border-y border-black py-1">O.S. #{order.number.toString().padStart(4, '0')}</div>
            <p className="text-[11px]">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div className="mb-2 uppercase text-[12px] space-y-1">
            <p><strong>CLI:</strong> {order.client.name}</p>
            <p><strong>PLACA:</strong> {order.motorcycle.plate.toUpperCase()}</p>
          </div>

          <div className="space-y-1 border-t border-black pt-1">
            {order.services.map(s => (
              <div key={s.id} className="flex justify-between items-start gap-1 text-[11px]">
                <span className="flex-1 break-words leading-tight">{s.description}</span>
                <span className="font-bold whitespace-nowrap">R${s.price.toFixed(2)}</span>
              </div>
            ))}
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-start gap-1 text-[11px]">
                <span className="flex-1 truncate">{item.quantity}x {item.product.name}</span>
                <span className="font-bold whitespace-nowrap">R${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-black pt-1 mt-3">
            <div className="flex justify-between font-black text-[18px]">
              <span>TOTAL:</span>
              <span>R$ {order.totalValue.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 text-center border-t border-black pt-2">
            <div className="border-b border-black w-3/4 mx-auto mb-1"></div>
            <p className="text-[11px] uppercase font-bold">Assinatura</p>
          </div>

          <p className="text-center mt-4 text-[11px] italic border-t border-dotted border-black pt-2 mb-0 pb-0">
            Obrigado pela preferência!
          </p>
          
          {/* Marcador de fim absoluto para o driver da impressora */}
          <div style={{ height: '1px', overflow: 'hidden' }}>.</div>
        </div>
      </div>
    </div>
  );
}