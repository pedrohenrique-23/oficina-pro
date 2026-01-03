// src/app/orders/new/page.tsx
import { ClientService } from "@/services/client-service";
import { ProductService } from "@/services/product-service";
import { OrderForm } from "../_components/order-form"; // Criaremos este componente a seguir
import { ClipboardPlus } from "lucide-react";

export default async function NewOrderPage() {
  // Buscamos dados para os seletores
  const [clients, products] = await Promise.all([
    ClientService.getAll(), // Precisamos garantir que este getAll traga as motos também
    ProductService.getAll()
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <ClipboardPlus className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
      </div>

      {/* Passamos os dados para o componente de cliente que lidará com a interatividade */}
      <OrderForm clients={clients} products={products} />
    </div>
  );
}