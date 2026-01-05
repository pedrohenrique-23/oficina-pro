// src/app/orders/[id]/edit/page.tsx
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrderForm } from "../../_components/order-form";

export default async function EditOrderPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Resolvemos o ID de forma assíncrona conforme o padrão do Next.js 15/16
  const { id } = await params;

  // Buscamos a O.S. com seus itens para preencher o formulário
  const order = await prisma.orderService.findUnique({
    where: { id },
    include: { items: true }
  });

  // Regra de Negócio: Se não existir ou já estiver finalizada, não edita
  if (!order || order.status === 'FINISHED') {
    notFound();
  }

  // Buscamos as listas necessárias para os Selects do formulário
  const clients = await prisma.client.findMany({ 
    include: { motorcycles: true } 
  });
  const products = await prisma.product.findMany();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Editar O.S. #{order.number.toString().padStart(4, '0')}
        </h1>
        <p className="text-muted-foreground">Altere as peças ou o valor da mão de obra abaixo.</p>
      </div>

      <OrderForm 
        clients={clients} 
        products={products} 
        initialData={order} // Passamos os dados para o formulário "nascê-los" preenchidos
      />
    </div>
  );
}