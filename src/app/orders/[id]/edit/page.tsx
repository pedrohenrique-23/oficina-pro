import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { OrderForm } from "../../_components/order-form";

interface EditOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditOrderPage({ params }: EditOrderPageProps) {
  const { id } = await params;

  // 1. Busca todos os dados necessários em paralelo para performance [cite: 2025-06-22]
  const [orderRaw, clientsRaw, productsRaw] = await Promise.all([
    prisma.orderService.findUnique({
      where: { id },
      include: {
        items: true,
        services: true,
      },
    }),
    prisma.client.findMany({
      include: { motorcycles: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // 2. Verificação de existência
  if (!orderRaw) {
    return notFound();
  }

  // 3. SERIALIZAÇÃO CRÍTICA: Convertendo Decimal para Number
  
  // Converte a lista de produtos global
  const products = productsRaw.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: Number(p.costPrice),
  }));

  // Converte os dados da Ordem (initialData)
  const initialData = {
    ...orderRaw,
    laborValue: Number(orderRaw.laborValue),
    totalValue: Number(orderRaw.totalValue),
    // Converte os preços dentro dos itens (peças)
    items: orderRaw.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
    })),
    // Converte os preços dentro dos novos serviços [cite: 2025-06-22]
    services: orderRaw.services.map((service) => ({
      ...service,
      price: Number(service.price),
    })),
  };

  // Garante que a lista de clientes também esteja segura
  const clients = clientsRaw.map((client) => ({
    ...client,
    motorcycles: client.motorcycles || [],
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase italic text-slate-900">
          Editar Ordem de Serviço
        </h1>
        <p className="text-slate-500 text-sm font-medium">
          Edição da O.S. número #{initialData.number.toString().padStart(4, "0")}
        </p>
      </div>
      
      <OrderForm 
        clients={clients} 
        products={products} 
        initialData={initialData} 
      />
    </div>
  );
}