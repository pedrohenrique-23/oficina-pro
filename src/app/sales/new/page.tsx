import prisma from "@/lib/prisma";
import { SaleForm } from "../_components/sale-form";

export default async function NewSalePage() {
  // 1. Removemos a busca de clientes (não é mais necessária) [cite: 2026-01-24]
  const productsRaw = await prisma.product.findMany({ 
    where: { stock: { gt: 0 } },
    orderBy: { name: "asc" } 
  });

  // 2. Resolve o erro da image_b6663e (Serialização de Decimal)
  const products = productsRaw.map((p) => ({
    ...p,
    price: Number(p.price),
    costPrice: Number(p.costPrice)
  }));

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black uppercase italic text-slate-900">
          Venda de Balcão
        </h1>
        <p className="text-slate-500 text-sm">Registro de venda rápida e anônima.</p>
      </div>

      {/* 🚀 CORREÇÃO: Removemos a prop 'clients' que causou o erro no log */}
      <SaleForm products={products} />
    </div>
  );
}