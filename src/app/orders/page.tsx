import prisma from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Eye, Edit2, Plus, Filter, DollarSign, Wrench, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FinishOrderButton } from "./_components/finish-order-button";
import { OrderDateFilter } from "./_components/order-date-filter";
import { cn } from "@/lib/utils";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
  const { status = "OPEN", from, to } = await searchParams;

  const dateFilter = from || to ? {
    createdAt: {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(`${to}T23:59:59`) : undefined,
    }
  } : {};

  const ordersRaw = await prisma.orderService.findMany({
    where: {
      ...(status !== "ALL" && { status: status as any }),
      ...dateFilter,
    },
    include: {
      client: true,
      motorcycle: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const orders = ordersRaw.map((order) => ({
    ...order,
    totalValue: Number(order.totalValue),
    laborValue: Number(order.laborValue),
  }));

  const totalRevenue = orders.reduce((acc, order) => acc + order.totalValue, 0);
  const totalLabor = orders.reduce((acc, order) => acc + order.laborValue, 0);
  const totalParts = totalRevenue - totalLabor;

  const tabs = [
    { label: "Abertas", value: "OPEN" },
    { label: "Finalizadas", value: "FINISHED" },
    { label: "Todas", value: "ALL" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-900">
            <ClipboardList className="w-8 h-8 text-blue-600" />
            Ordens de Serviço
          </h1>
          <p className="text-muted-foreground">Gerencie os atendimentos da oficina.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/orders/new">
            <Plus className="w-4 h-4" /> Nova Ordem
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit border">
          {tabs.map((tab) => (
            <Button
              key={tab.value}
              variant={status === tab.value ? "secondary" : "ghost"}
              size="sm"
              asChild
              className={cn(
                "rounded-md px-6 font-bold transition-all",
                status === tab.value ? "bg-white shadow-sm text-blue-600 hover:bg-white" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Link href={`/orders?status=${tab.value}${from ? `&from=${from}` : ""}${to ? `&to=${to}` : ""}`}>
                {tab.label}
              </Link>
            </Button>
          ))}
        </div>
        <OrderDateFilter />
      </div>

      {/* 📋 1. Tabela de Ordens (Agora no topo) */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-slate-700">
            Registros Filtrados: <span className="text-blue-600 font-bold">{orders.length}</span>
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="w-3 h-3" /> Exibindo listagem completa abaixo.
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[100px]">Nº O.S.</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Geral</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                    Nenhuma ordem encontrada neste filtro.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-mono font-bold text-blue-700">
                      #{order.number.toString().padStart(4, "0")}
                    </TableCell>
                    <TableCell className="font-medium">{order.client.name}</TableCell>
                    <TableCell className="text-slate-600">
                      {order.motorcycle.brand} {order.motorcycle.model}
                      <span className="text-xs ml-2 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold text-slate-500">
                        {order.motorcycle.plate}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-black tracking-tight",
                        order.status === "FINISHED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      )}>
                        {order.status === "FINISHED" ? "FINALIZADA" : "ABERTA"}
                      </span>
                    </TableCell>
                    <TableCell className="font-bold text-slate-900">
                      R$ {order.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {order.status !== "FINISHED" && (
                        <>
                          <FinishOrderButton id={order.id} orderNumber={order.number.toString().padStart(4, "0")} />
                          <Button variant="ghost" size="icon" asChild title="Editar O.S.">
                            <Link href={`/orders/${order.id}/edit`}><Edit2 className="w-4 h-4 text-amber-600" /></Link>
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" asChild title="Ver detalhes">
                        <Link href={`/orders/${order.id}`}><Eye className="w-4 h-4 text-slate-600" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 💰 2. Cards de Resumo (Agora embaixo da tabela) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
        <Card className="bg-blue-50 border-blue-100 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 bg-blue-600 rounded-lg"><DollarSign className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase">Faturamento Período</p>
              <h3 className="text-2xl font-black text-blue-900">R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 bg-amber-600 rounded-lg"><Wrench className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase">Mão de Obra</p>
              <h3 className="text-2xl font-black text-amber-900">R$ {totalLabor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100 shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-2 bg-purple-600 rounded-lg"><Package className="w-5 h-5 text-white" /></div>
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase">Venda de Peças</p>
              <h3 className="text-2xl font-black text-purple-900">R$ {totalParts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}