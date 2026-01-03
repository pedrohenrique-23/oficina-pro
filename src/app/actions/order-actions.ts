// src/app/actions/order-actions.ts
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrderAction(data: {
  clientId: string;
  motorcycleId: string;
  description: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const totalValue = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

      const order = await tx.orderService.create({
        data: {
          clientId: data.clientId,
          motorcycleId: data.motorcycleId,
          description: data.description,
          totalValue: totalValue,
          status: 'OPEN',
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          }
        }
      });

      // Validação de estoque aprimorada com mensagem descritiva
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        
        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Estoque insuficiente: "${product?.name || 'Item'}" solicitado ${item.quantity}un, mas temos apenas ${product?.stock || 0}un.`
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return order;
    });

    revalidatePath("/orders");
    revalidatePath("/products");
    return { success: true, orderId: result.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao criar Ordem de Serviço" };
  }
}