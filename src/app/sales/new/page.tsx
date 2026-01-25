// src/app/sales/new/page.tsx

import prisma from "@/lib/prisma";
import { SaleForm } from "../_components/sale-form";

export default async function NewSalePage() {
  const [clients, productsRaw] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ 
      where: { stock: { gt: 0 } },
      orderBy: { name: "asc" } 
    }),
  ]);

  // 🚀 A CORREÇÃO: Mapeamos os produtos para transformar Decimal em Number
  const products = productsRaw.map((p) => ({
    ...p,
    price: Number(p.price),      // Converte o objeto Decimal para número puro
    costPrice: Number(p.costPrice) // Faz o mesmo com o preço de custo para evitar o erro
  }));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase italic text-slate-900">
          Venda de Balcão
        </h1>
        <p className="text-slate-500 text-sm">Registro de venda direta sem ordem de serviço.</p>
      </div>

      {/* Agora os dados estão limpos e o erro vai sumir! */}
      <SaleForm clients={clients} products={products} />
    </div>
  );
}