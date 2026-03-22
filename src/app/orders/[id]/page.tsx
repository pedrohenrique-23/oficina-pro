import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bike, User, Wrench, Package } from "lucide-react";
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

  // Sanitização de Decimal para Number (evita erro de serialização do Next.js)
  const order = {
    ...orderRaw,
    totalValue: Number(orderRaw.totalValue),
    laborValue: Number(orderRaw.laborValue),
    services: orderRaw.services.map(s => ({
      ...s,
      price: Number(s.price)
    })),
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
          VISÃO DE TELA (Desktop) - Escondida na Impressão
          ========================================================== */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/orders">
            <ArrowLeft className="w-4 h-4" /> Voltar
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
        <CardHeader className="border-b text-center space-y-2 text-slate-900">
          <div className="flex justify-between items-start text-left">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-tighter">Oficina Pro</h1>
              <p className="text-xs text-muted-foreground italic">Especialistas em Duas Rodas</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold text-blue-900 italic text-slate-900">
                O.S. #{order.number.toString().padStart(4, '0')}
              </div>
              <p className="text-xs font-bold">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-6">
            <div className="space-y-1 text-slate-900">
              <h3 className="text-xs font-bold flex items-center gap-2 uppercase text-muted-foreground">
                <User className="w-4 h-4" /> Dados do Cliente
              </h3>
              <p className="font-semibold text-lg">{order.client.name}</p>
              <p className="text-sm">Tel: {order.client.phone}</p>
            </div>
            <div className="space-y-1 text-slate-900">
              <h3 className="text-xs font-bold flex items-center gap-2 uppercase text-muted-foreground">
                <Bike className="w-4 h-4" /> Dados do Veículo
              </h3>
              <p className="font-semibold text-lg">{order.motorcycle.brand} {order.motorcycle.model}</p>
              <p className="text-sm font-mono uppercase bg-slate-100 px-2 py-0.5 rounded inline-block">
                Placa: {order.motorcycle.plate}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground"><Wrench className="w-4 h-4" /> Serviços</h3>
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
            <h3 className="text-xs font-bold uppercase flex items-center gap-2 text-muted-foreground"><Package className="w-4 h-4" /> Peças</h3>
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
            <p className="text-4xl font-black text-blue-900 tracking-tighter">R$ {order.totalValue.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================================
          🚀 VISÃO TÉRMICA (48mm) - Ajustada para parar o papel
          ========================================================== */}
      <div className="hidden print:block w-[48mm] font-mono leading-tight text-black bg-white mx-auto">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { 
              size: 58mm auto; 
              margin: 0 !important; 
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important; /* Essencial para o papel parar no fim */
              min-height: 0 !important;
              overflow: visible !important;
              zoom: 100%;
            }
            body {
              width: 48mm !important; /* Área imprimível do seu driver */
              -webkit-print-color-adjust: exact;
            }
            /* Esconde links, data e títulos que o navegador tenta injetar */
            footer, header, .header, .footer { display: none !important; }
          }
        `}} />

        <div className="p-0">
          <div className="text-center border-b border-dashed border-black pb-2 mb-2">
            <h2 className="font-bold text-[12px] uppercase">Oficina Pro</h2>
            <p className="font-bold mt-0.5 text-[10px]">O.S. #{order.number.toString().padStart(4, '0')}</p>
            <p className="text-[9px]">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div className="mb-2 uppercase space-y-0.5 border-b border-dashed border-black pb-1 text-[10px]">
            <p><strong>CLIENTE:</strong> {order.client.name}</p>
            <p><strong>PLACA:</strong> {order.motorcycle.plate.toUpperCase()}</p>
          </div>

          <div className="font-bold uppercase text-[9px] border-b border-black mb-1">Serviços</div>
          {order.services.map(s => (
            <div key={s.id} className="flex justify-between items-start gap-1 mb-1 text-[10px]">
              <span className="flex-1 break-words">{s.description}</span>
              <span className="font-bold">{s.price.toFixed(2)}</span>
            </div>
          ))}

          <div className="font-bold uppercase text-[9px] border-b border-black mb-1 mt-2">Peças</div>
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-start gap-1 mb-1 text-[10px]">
              <span className="flex-1 truncate">{item.quantity}x {item.product.name}</span>
              <span className="font-bold">{item.subtotal.toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t-2 border-black pt-1 mt-2 space-y-1">
            <div className="flex justify-between font-black text-[13px] pt-1">
              <span>TOTAL:</span>
              <span>R$ {order.totalValue.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 text-center pt-2">
            <div className="border-t border-black w-full mb-1"></div>
            <p className="text-[8px] uppercase font-bold tracking-tighter">Assinatura do Cliente</p>
          </div>

          <p className="text-center mt-4 text-[8px] italic border-t border-dotted border-black pt-2 uppercase">
            Obrigado pela preferência!
          </p>
          
          <div className="h-4"></div> {/* Pequeno espaço para facilitar o corte manual */}
        </div>
      </div>
    </div>
  );
}