import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bike, User, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { PrintOrderButton } from "../_components/print-order-button";
import { FinishOrderButton } from "../_components/finish-order-button";

// Tipagem correta para Next.js 15/16: params é uma Promise
interface OrderDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsProps) {
  // 1. Resolvemos a Promise dos parâmetros da URL
  const { id } = await params;

  // 2. Buscamos a O.S. com todos os relacionamentos necessários
  const orderRaw = await prisma.orderService.findUnique({
    where: { id },
    include: {
      client: true,
      motorcycle: true,
      items: {
        include: { product: true }
      }
    }
  });

  // Se o ID não existir no banco, redireciona para página 404
  if (!orderRaw) notFound();

  // 3. Sanitização: Convertemos Decimais do Prisma em Numbers do JS
  const order = {
    ...orderRaw,
    totalValue: Number(orderRaw.totalValue),
    items: orderRaw.items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.quantity) * Number(item.unitPrice)
    }))
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Barra de Ações (Escondida na impressão) */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/orders">
            <ArrowLeft className="w-4 h-4" /> Voltar para Lista
          </Link>
        </Button>
        <div className="flex gap-2">
          {/* Só permite finalizar se a ordem ainda estiver aberta */}
          {order.status !== 'FINISHED' && (
            <FinishOrderButton 
              id={order.id} 
              orderNumber={order.number.toString()} 
            />
          )}
          <PrintOrderButton />
        </div>
      </div>

      {/* Recibo da Ordem de Serviço */}
      <Card className="border-2 shadow-none print:border-0">
        <CardHeader className="border-b text-center space-y-2">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <h1 className="text-2xl font-bold uppercase tracking-tighter">Oficina Pro</h1>
              <p className="text-xs text-muted-foreground italic">Especialistas em Duas Rodas</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold">O.S. #{order.number.toString().padStart(4, '0')}</div>
              <p className="text-xs">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* Informações de Cadastro */}
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

          {/* Descrição do Problema/Serviço */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase text-muted-foreground">
              <ClipboardCheck className="w-4 h-4" /> Descrição do Serviço
            </h3>
            <div className="bg-muted/30 p-4 rounded-md italic text-sm">
              {order.description || "Nenhuma descrição detalhada informada."}
            </div>
          </div>

          {/* Listagem de Peças e Mão de Obra */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase text-muted-foreground">Itens da Ordem</h3>
            <Table className="border">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-center w-[80px]">Qtd</TableHead>
                  <TableHead className="text-right">Unitário</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">R$ {item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">R$ {item.subtotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totalizador Financeiro */}
          <div className="flex justify-end pt-4 border-t-2 border-double">
            <div className="text-right">
              <p className="text-sm text-muted-foreground uppercase font-bold">Valor Total a Pagar</p>
              <p className="text-4xl font-black text-blue-900 tracking-tight">
                R$ {order.totalValue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Campo para assinatura na via impressa */}
          <div className="hidden print:block pt-16 text-center border-t border-dashed mt-10">
            <p className="text-xs uppercase font-bold">Assinatura do Cliente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}