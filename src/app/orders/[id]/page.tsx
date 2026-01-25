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

  // 1. Busca a O.S. incluindo a nova relação de múltiplos serviços
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

  // 2. Sanitização e Mapeamento de Dados
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
    <div className="p-8 max-w-4xl mx-auto space-y-6 print:p-0 print:max-w-full">
      {/* Barra de Ações: escondida durante a impressão */}
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

      <Card className="border-2 shadow-none print:border-0 print:shadow-none">
        <CardHeader className="border-b text-center space-y-2">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h1 className="text-2xl font-bold uppercase tracking-tighter">Oficina Pro</h1>
              <p className="text-xs text-muted-foreground italic">Especialistas em Duas Rodas</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold italic">O.S. #{order.number.toString().padStart(4, '0')}</div>
              <p className="text-xs">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          <div className="grid grid-cols-2 gap-8 border-b pb-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase text-muted-foreground">
                <User className="w-4 h-4" /> Dados do Cliente
              </h3>
              <p className="font-semibold text-lg">{order.client.name}</p>
              <p className="text-sm">Telefone: {order.client.phone}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2 uppercase text-muted-foreground">
                <Bike className="w-4 h-4" /> Dados do Veículo
              </h3>
              <p className="font-semibold text-lg">{order.motorcycle.brand} {order.motorcycle.model}</p>
              <p className="text-sm font-mono uppercase">Placa: {order.motorcycle.plate}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase text-muted-foreground">
              <ClipboardCheck className="w-4 h-4" /> Observações da Ordem
            </h3>
            <div className="bg-muted/30 p-4 rounded-md italic text-sm">
              {order.description || "Nenhuma descrição detalhada informada."}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Serviços / Mão de Obra
            </h3>
            <Table className="border">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="print:text-black">Descrição do Serviço</TableHead>
                  <TableHead className="text-right w-[150px] print:text-black">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.services.map((service) => (
                  <TableRow key={service.id} className="print:border-b">
                    <TableCell className="font-medium">{service.description}</TableCell>
                    <TableCell className="text-right font-bold">R$ {service.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" /> Peças Utilizadas
            </h3>
            <Table className="border">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="print:text-black">Descrição da Peça</TableHead>
                  <TableHead className="text-center w-[80px] print:text-black">Qtd</TableHead>
                  <TableHead className="text-right print:text-black">Unitário</TableHead>
                  <TableHead className="text-right print:text-black">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground italic text-xs py-4">
                      Nenhuma peça utilizada nesta ordem.
                    </TableCell>
                  </TableRow>
                ) : (
                  order.items.map((item) => (
                    <TableRow key={item.id} className="print:border-b">
                      <TableCell className="font-medium">{item.product.name}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">R$ {item.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-double border-slate-300">
            <div className="text-right">
              <div className="flex flex-col mb-2 text-[10px] font-bold text-muted-foreground uppercase print:text-black">
                <span>Mão de Obra: R$ {order.laborValue.toFixed(2)}</span>
                <span>Peças: R$ {totalParts.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground uppercase font-bold print:text-black">Valor Total Geral</p>
              <p className="text-4xl font-black text-blue-900 tracking-tight print:text-black">
                R$ {order.totalValue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="hidden print:block pt-16 text-center border-t border-dashed mt-10">
            <div className="max-w-[300px] mx-auto border-t border-slate-400 pt-2">
              <p className="text-[10px] uppercase font-bold">Assinatura do Cliente</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}