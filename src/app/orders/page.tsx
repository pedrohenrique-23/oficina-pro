import prisma from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FinishOrderButton } from "./_components/finish-order-button";

export default async function OrdersPage() {
  const ordersRaw = await prisma.orderService.findMany({
    include: {
      client: true,
      motorcycle: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Sanitização de Decimais para evitar o erro "Decimal objects are not supported"
  const orders = ordersRaw.map(order => ({
    ...order,
    totalValue: Number(order.totalValue),
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardList className="w-8 h-8 text-blue-600" />
          Ordens de Serviço
        </h1>
        <Button asChild>
          <Link href="/orders/new">Nova Ordem de Serviço</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº O.S.</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Moto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono font-bold">
                    #{order.number.toString().padStart(4, '0')}
                  </TableCell>
                  <TableCell>{order.client.name}</TableCell>
                  <TableCell>{order.motorcycle.brand} {order.motorcycle.model}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === 'FINISHED' ? 'bg-green-100 text-green-700' : 
                      order.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'FINISHED' ? 'FINALIZADA' : order.status}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-blue-900">
                    R$ {order.totalValue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* Só mostra botão de finalizar se não estiver concluída */}
                    {order.status !== 'FINISHED' && (
                      <FinishOrderButton 
                        id={order.id} 
                        orderNumber={order.number.toString().padStart(4, '0')} 
                      />
                    )}
                    <Button variant="ghost" size="icon" asChild title="Ver detalhes">
                      <Link href={`/orders/${order.id}`}>
                        <Eye className="w-4 h-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}