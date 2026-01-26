"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";

/**
 * CRIAR VENDA DE BALCÃO (Direta e Anônima) [cite: 2026-01-24]
 */
export async function createSaleAction(data: {
  clientId?: string; // Opcional para vendas rápidas [cite: 2026-01-24]
  paymentMethod: PaymentMethod;
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Calcula o total da venda
      const totalValue = data.items.reduce(
        (acc, item) => acc + item.quantity * item.unitPrice,
        0
      );

      // 2. Cria o registro da Venda [cite: 2026-01-24]
      const sale = await tx.sale.create({
        data: {
          clientId: data.clientId || null, // Salva nulo se não houver cliente [cite: 2026-01-24]
          paymentMethod: data.paymentMethod,
          totalValue: totalValue,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
      });

      // 3. Baixa automática do estoque
      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        
        if (!product || product.stock < item.quantity) {
          throw new Error(`Estoque insuficiente para o produto: ${product?.name || 'Desconhecido'}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return sale;
    });

    revalidatePath("/sales");
    revalidatePath("/products");
    revalidatePath("/"); 
    
    return { success: true, saleId: result.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao realizar venda." };
  }
}