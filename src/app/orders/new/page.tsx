import prisma from "@/lib/prisma";
import { OrderForm } from "../_components/order-form";

export default async function NewOrderPage() {
  const [clients, productsRaw] = await Promise.all([
    // Buscamos clientes e suas motos
    prisma.client.findMany({
      include: { motorcycles: true },
      orderBy: { name: "asc" }
    }),
    // Buscamos os produtos/peças
    prisma.product.findMany({
      orderBy: { name: "asc" }
    }),
  ]);

  // 🚀 O AJUSTE CRÍTICO: Converter Decimal para Number
  const products = productsRaw.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: Number(p.costPrice),
  }));

  // Também precisamos garantir que as motos dentro dos clientes sejam passadas corretamente
  // Se o seu Prisma já retorna as motos dentro do objeto client, o mapeamento abaixo ajuda:
  const serializedClients = clients.map(client => ({
    ...client,
    motorcycles: client.motorcycles.map(m => ({
      ...m,
      // Caso a moto tenha algum campo Decimal (como valor de mercado), converta aqui
    }))
  }));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-black uppercase italic">Nova Ordem de Serviço</h1>
      
      <OrderForm 
        clients={serializedClients} 
        products={products} 
      />
    </div>
  );
}