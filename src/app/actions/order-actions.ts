"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client"; // Importação necessária para o novo parâmetro

/**
 * 1. CRIAR ORDEM DE SERVIÇO
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

/**
 * 2. ATUALIZAR ORDEM DE SERVIÇO
 */
export async function updateOrderAction(id: string, data: {
  clientId: string;
  motorcycleId: string;
  description: string;
  laborValue: number;
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  try {
    await prisma.$transaction(async (tx) => {
      const oldOrder = await tx.orderService.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!oldOrder) throw new Error("Ordem de Serviço não encontrada.");
      if (oldOrder.status === 'FINISHED') throw new Error("O.S. finalizada não pode ser editada.");

      for (const item of oldOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      await tx.orderItem.deleteMany({ where: { orderServiceId: id } });

      const itemsTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const finalTotal = itemsTotal + data.laborValue;

      await tx.orderService.update({
        where: { id },
        data: {
          clientId: data.clientId,
          motorcycleId: data.motorcycleId,
          description: data.description,
          laborValue: data.laborValue,
          totalValue: finalTotal,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          }
        }
      });

      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    });

    revalidatePath("/orders");
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Erro ao atualizar O.S." };
  }
}

/**
 * 3. FINALIZAR ORDEM DE SERVIÇO (Modificado)
 * Agora recebe o método de pagamento e data de recebimento
 */
export async function finishOrderAction(id: string, paymentMethod: PaymentMethod) {
  try {
    await prisma.orderService.update({
      where: { id },
      data: { 
        status: 'FINISHED',
        paymentMethod: paymentMethod, // Vincula o método selecionado
        paidAt: new Date(),           // Seta a data do faturamento real
      }
    });

    revalidatePath("/orders");
    revalidatePath("/"); // Atualiza o Dashboard imediatamente
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao finalizar a ordem." };
  }
}

/**
 * 4. EXCLUIR ORDEM DE SERVIÇO
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