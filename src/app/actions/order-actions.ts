"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** * 1. CRIAR ORDEM DE SERVIÇO 
 * Agora inclui laborValue no cálculo e no banco
 */
export async function createOrderAction(data: {
  clientId: string;
  motorcycleId: string;
  description: string;
  laborValue: number;
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Cálculo: Somatória das peças + Mão de Obra
      const itemsTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const finalTotal = itemsTotal + data.laborValue;

      const order = await tx.orderService.create({
        data: {
          clientId: data.clientId,
          motorcycleId: data.motorcycleId,
          description: data.description,
          laborValue: data.laborValue,
          totalValue: finalTotal,
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

      // Baixa no estoque apenas para os produtos utilizados
      for (const item of data.items) {
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
    return { success: false, error: error.message || "Erro ao criar O.S." };
  }
}

/** * 2. FINALIZAR ORDEM DE SERVIÇO 
 * Altera o status para impedir futuras edições
 */
export async function finishOrderAction(id: string) {
  try {
    await prisma.orderService.update({
      where: { id },
      data: { status: 'FINISHED' }
    });
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao finalizar a ordem de serviço." };
  }
}

/** * 3. ATUALIZAR INFORMAÇÕES BÁSICAS 
 * Permite editar a descrição e status enquanto aberta
 */
export async function updateOrderInfoAction(id: string, data: { status: any, description: string }) {
  try {
    await prisma.orderService.update({
      where: { id },
      data: {
        status: data.status,
        description: data.description,
      }
    });
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar os dados da ordem." };
  }
}

/** * 4. EXCLUIR ORDEM DE SERVIÇO 
 * Impede a exclusão de ordens finalizadas (Regra de Negócio)
 */
export async function deleteOrderAction(id: string) {
  try {
    const order = await prisma.orderService.findUnique({ where: { id } });
    
    if (order?.status === 'FINISHED') {
      return { success: false, error: "Não é permitido excluir uma O.S. finalizada." };
    }

    await prisma.orderService.delete({ where: { id } });
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao tentar excluir a ordem." };
  }
}