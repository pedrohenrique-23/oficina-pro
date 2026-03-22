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

  // 1. Busca os dados no banco
  const orderRaw = await prisma.orderService.findUnique({
    where: { id },
    include: {
      client: true,
      motorcycle: true,
      services: true, 
      items: { include: { product: true } }
    }
  });

  if (!orderRaw) notFound();

  // 2. Converte Decimal para Number (evita erro de serialização)
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
          VISÃO DE TELA - Escondida na Impressão
          ========================================================== */}
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

      <Card className="border-2 shadow-none print:hidden">
        <CardHeader className="border-b text-center space-y-2">
           <h1 className="text-2xl font-bold uppercase tracking-tighter text-slate-900">Oficina Pro</h1>
           <div className="text-xl font-mono font-bold text-blue-900 italic text-right">
             O.S. #{order.number.toString().padStart(4, '0')}
           </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 text-slate-900">
          <p className="font-semibold text-lg">Cliente: {order.client.name}</p>
          <p className="font-semibold text-lg">Moto: {order.motorcycle.brand} {order.motorcycle.model}</p>
          <div className="text-right pt-4 border-t-2 border-double">
            <p className="text-4xl font-black text-blue-900">R$ {order.totalValue.toFixed(2)}</p>
          </div>
        </CardContent>
      </Card>

      {/* ==========================================================
          🚀 VISÃO TÉRMICA (384px / 48mm) - Aparece APENAS na Impressão
          ========================================================== */}
      <div className="hidden print:block w-[384px] font-mono text-black bg-white mx-auto p-0 border-none">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { 
              size: 58mm auto; 
              margin: 0 !important; 
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              width: 384px !important;
              zoom: 1.0 !important; 
            }
            body {
              -webkit-print-color-adjust: exact;
            }
          }
        `}} />

        <div className="p-2 w-[384px]">
          {/* Cabeçalho Térmico */}
          <div className="text-center border-b-2 border-black pb-2 mb-4">
            {/* Logo da Oficina (se você já tiver o arquivo na pasta public) */}
            <div className="flex justify-center mb-2">
              <img src="/logo-oficina.png" alt="Logo" className="w-[200px] h-auto block mx-auto" />
            </div>
            {/* Caso prefira texto: <h2 className="font-bold text-[26px] uppercase">Oficina Pro</h2> */}
            <p className="text-[14px] italic">Especialistas em Duas Rodas</p>
            <p className="font-bold text-[20px] mt-2 border-y-2 border-black py-1">
              O.S. #{order.number.toString().padStart(4, '0')}
            </p>
            <p className="text-[14px] mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')} {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          {/* Dados do Cliente e Veículo */}
          <div className="mb-4 space-y-1 text-[16px] uppercase font-bold border-b border-black pb-2">
            <p>CLIENTE: {order.client.name}</p>
            <p>MOTO: {order.motorcycle.model}</p>
            <p>PLACA: {order.motorcycle.plate}</p>
          </div>

          {/* Lista de Serviços e Peças */}
          <div className="space-y-1">
            <p className="font-bold text-[16px] uppercase border-b border-black mb-1">Itens da Ordem</p>
            {order.services.map(s => (
              <div key={s.id} className="flex justify-between text-[16px] mb-1">
                <span className="flex-1 truncate mr-2">{s.description}</span>
                <span className="font-bold">R${s.price.toFixed(2)}</span>
              </div>
            ))}
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-[16px] mb-1">
                <span className="flex-1 truncate mr-2">{item.quantity}x {item.product.name}</span>
                <span className="font-bold">R${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totais do Recibo */}
          <div className="border-t-4 border-black pt-2 mt-4 space-y-1">
            <div className="flex justify-between text-[14px] font-bold">
              <span>MÃO DE OBRA:</span>
              <span>R$ {order.laborValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[14px] font-bold">
              <span>PEÇAS:</span>
              <span>R$ {totalParts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[26px] font-black border-t-2 border-black pt-1 mt-1">
              <span>TOTAL:</span>
              <span>R$ {order.totalValue.toFixed(2)}</span>
            </div>
          </div>

          {/* Assinatura */}
          <div className="mt-12 text-center pt-2">
            <div className="border-t-2 border-black w-full mb-1"></div>
            <p className="text-[14px] font-bold uppercase tracking-tight">Assinatura do Cliente</p>
          </div>

          <p className="text-center mt-6 text-[12px] italic border-t border-dotted border-black pt-2 uppercase">
            Obrigado pela preferência!
          </p>
          
          <div className="h-10"></div> {/* Espaço para o corte manual */}
        </div>
      </div>
    </div>
  );
}