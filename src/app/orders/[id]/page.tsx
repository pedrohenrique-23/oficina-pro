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
      
      {/* ==========================================================
          🖥️ VISÃO DE TELA - Completa e Detalhada (Escondida na Impressão)
          ========================================================== */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/orders">
            <ArrowLeft className="w-4 h-4" /> Voltar para Lista
          </Link>
        </Button>
        <div className="flex gap-2">
          {order.status !== 'FINISHED' && (
            <FinishOrderButton 
              id={order.id} 
              orderNumber={order.number.toString()} 
            />
          )}
          <PrintOrderButton />
        </div>
      </div>

      <Card className="border-2 shadow-none print:hidden">
        <CardHeader className="border-b text-center space-y-2">
          <div className="flex justify-between items-start text-left">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter text-slate-900">Oficina Pro</h1>
              <p className="text-xs text-muted-foreground italic">Especialistas em Duas Rodas</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold text-blue-900 italic">
                O.S. #{order.number.toString().padStart(4, '0')}
              </div>
              <p className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-6">
            <div className="space-y-1">
              <h3 className="text-xs font-bold flex items-center gap-2 uppercase text-muted-foreground">
                <User className="w-4 h-4" /> Dados do Cliente
              </h3>
              <p className="font-semibold text-lg">{order.client.name}</p>
              <p className="text-sm">Tel: {order.client.phone}</p>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold flex items-center gap-2 uppercase text-muted-foreground">
                <Bike className="w-4 h-4" /> Dados do Veículo
              </h3>
              <p className="font-semibold text-lg">{order.motorcycle.brand} {order.motorcycle.model}</p>
              <p className="text-sm font-mono uppercase bg-slate-100 px-2 py-0.5 rounded inline-block">
                Placa: {order.motorcycle.plate}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold flex items-center gap-2 uppercase text-muted-foreground">
              <ClipboardCheck className="w-4 h-4" /> Observações da Ordem
            </h3>
            <div className="bg-muted/30 p-4 rounded-md italic text-sm border-l-4 border-blue-500">
              {order.description || "Nenhuma descrição detalhada informada."}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground">
              <Wrench className="w-4 h-4" /> Serviços / Mão de Obra
            </h3>
            <Table className="border text-slate-900">
              <TableBody>
                {order.services.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.description}</TableCell>
                    <TableCell className="text-right font-bold">R$ {s.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4" /> Peças Utilizadas
            </h3>
            <Table className="border text-slate-900">
              <TableBody>
                {order.items.length === 0 ? (
                  <TableRow><TableCell className="text-center italic py-4">Nenhuma peça utilizada.</TableCell></TableRow>
                ) : (
                  order.items.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.product.name} ({i.quantity}x)</TableCell>
                      <TableCell className="text-right font-bold text-blue-700">R$ {i.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-right pt-4 border-t-2 border-double">
            <p className="text-xs font-bold text-muted-foreground uppercase">Valor Total Geral</p>
            <p className="text-4xl font-black text-blue-900 tracking-tighter text-slate-900">
              R$ {order.totalValue.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================================
          🚀 VISÃO TÉRMICA (Ultra-Zoom 384px) - Aparece APENAS na Impressão
          ========================================================== */}
      <div className="hidden print:block w-[384px] font-mono text-black bg-white mx-auto">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: 58mm auto; margin: 0 !important; }
            html, body {
              margin: 0 !important; padding: 0 !important;
              width: 384px !important; height: auto !important;
              zoom: 1.0 !important; overflow: visible !important;
            }
          }
        `}} />

        <div className="p-2 w-[384px]">
          <div className="text-center border-b-2 border-black pb-2 mb-4">
            <h2 className="font-bold text-[24px] uppercase leading-none">Oficina Pro</h2>
            <p className="text-[14px] mt-1 italic">Especialistas em Duas Rodas</p>
            <p className="font-bold text-[18px] mt-2 border-y border-black py-1">
              O.S. #{order.number.toString().padStart(4, '0')}
            </p>
            <p className="text-[12px]">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div className="mb-4 space-y-1 text-[16px] uppercase border-b border-dashed border-black pb-2">
            <p><strong>CLIENTE:</strong> {order.client.name}</p>
            <p><strong>MOTO:</strong> {order.motorcycle.model}</p>
            <p><strong>PLACA:</strong> {order.motorcycle.plate.toUpperCase()}</p>
          </div>

          <div className="font-bold uppercase text-[14px] border-b border-black mb-2">Serviços / Peças</div>
          {order.services.map(s => (
            <div key={s.id} className="flex justify-between items-start gap-1 mb-2 text-[14px]">
              <span className="flex-1 break-words leading-tight">{s.description}</span>
              <span className="font-bold whitespace-nowrap">R${s.price.toFixed(2)}</span>
            </div>
          ))}
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-start gap-1 mb-2 text-[14px]">
              <span className="flex-1 truncate mr-1">{item.quantity}x {item.product.name}</span>
              <span className="font-bold whitespace-nowrap">R${item.subtotal.toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t-4 border-black pt-2 mt-4 space-y-1">
            <div className="flex justify-between text-[14px] uppercase">
              <span>Mão de Obra:</span>
              <span>R$ {order.laborValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[14px] uppercase border-b border-black pb-1 mb-1">
              <span>Peças:</span>
              <span>R$ {totalParts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-[22px]">
              <span>TOTAL:</span>
              <span>R$ {order.totalValue.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-12 text-center border-t border-black pt-2">
            <p className="text-[12px] font-bold uppercase">Assinatura do Cliente</p>
          </div>

          <p className="text-center mt-6 text-[12px] italic border-t border-dotted border-black pt-2">
            Obrigado pela preferência!
          </p>
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
}