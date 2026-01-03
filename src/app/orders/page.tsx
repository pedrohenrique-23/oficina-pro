// src/app/orders/page.tsx
import { OrderService } from "@/services/order-service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Função auxiliar para estilizar o status (UX para o seu pai)
const getStatusDetails = (status: string) => {
  switch (status) {
    case 'OPEN':
      return { label: 'Aberta', color: 'bg-blue-100 text-blue-700', icon: <AlertCircle className="w-3 h-3" /> };
    case 'IN_PROGRESS':
      return { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> };
    case 'FINISHED':
      return { label: 'Finalizada', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-700', icon: null };
  }
};

export default async function OrdersPage() {
  const orders = await OrderService.getAll();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ClipboardList className="w-8 h-8" />
          Ordens de Serviço
        </h1>
        {/* Botão para a futura tela de criação */}
        <Button asChild className="gap-2">
          <Link href="/orders/new">
            Nova O.S.
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Nº O.S.</TableHead>
                <TableHead>Cliente / Moto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhuma ordem de serviço encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const statusInfo = getStatusDetails(order.status);
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-bold">
                        #{order.number.toString().padStart(4, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{order.client.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {order.motorcycle.brand} {order.motorcycle.model} ({order.motorcycle.plate})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        R$ {Number(order.totalValue).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}