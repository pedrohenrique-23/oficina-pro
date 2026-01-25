"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMethod } from "@prisma/client";

/**
 * 1. CRIAR ORDEM DE SERVIÇO
 * Realiza o cálculo de totais, cria a O.S. com múltiplos serviços e baixa o estoque.
 */
export async function createOrderAction(data: {
  clientId: string;
  motorcycleId: string;
  description: string;
  services: { description: string; price: number }[];
  items: { productId: string; quantity: number; unitPrice: number }[];
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Cálculos de Totais
      const laborTotal = data.services.reduce((acc, s) => acc + s.price, 0);
      const itemsTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const finalTotal = itemsTotal + laborTotal;

      const order = await tx.orderService.create({
        data: {
          clientId: data.clientId,
          motorcycleId: data.motorcycleId,
          description: data.description,
          laborValue: laborTotal,
          totalValue: finalTotal,
          status: 'OPEN',
          services: {
            create: data.services.map(s => ({
              description: s.description,
              price: s.price,
            }))
          },
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          }
        }
      });

      // Baixa de estoque automatizada
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
    return { success: true as const, orderId: result.id };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Erro ao criar O.S." };
  }
}

/**
 * 2. ATUALIZAR ORDEM DE SERVIÇO
 * Gerencia o estorno de estoque antigo, limpa registros e reinserte os novos dados.
 */
export async function updateOrderAction(id: string, data: {
  clientId: string;
  motorcycleId: string;
  description: string;
  services: { description: string; price: number }[];
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

      // 1. Devolve o estoque antigo para o sistema
      for (const item of oldOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      // 2. Limpa os registros antigos para reinserção
      await tx.orderItem.deleteMany({ where: { orderServiceId: id } });
      await tx.serviceItem.deleteMany({ where: { orderServiceId: id } });

      const laborTotal = data.services.reduce((acc, s) => acc + s.price, 0);
      const itemsTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const finalTotal = itemsTotal + laborTotal;

      // 3. Atualiza a O.S. principal
      await tx.orderService.update({
        where: { id },
        data: {
          clientId: data.clientId,
          motorcycleId: data.motorcycleId,
          description: data.description,
          laborValue: laborTotal,
          totalValue: finalTotal,
          services: {
            create: data.services.map(s => ({
              description: s.description,
              price: s.price,
            }))
          },
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            }))
          }
        }
      });

      // 4. Nova baixa de estoque baseada na edição
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    });

    revalidatePath("/orders");
    revalidatePath("/products");
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Erro ao atualizar O.S." };
  }
}

/**
 * 3. FINALIZAR ORDEM DE SERVIÇO
 * Registra o faturamento e o método de pagamento.
 */
export async function finishOrderAction(id: string, paymentMethod: PaymentMethod) {
  try {
    await prisma.orderService.update({
      where: { id },
      data: { 
        status: 'FINISHED',
        paymentMethod: paymentMethod,
        paidAt: new Date(),
      }
    });

    revalidatePath("/orders");
    revalidatePath("/"); 
    return { success: true as const };
  } catch (error: any) {
    return { success: false as const, error: "Erro ao finalizar a ordem." };
  }
}

/**
 * 4. EXCLUIR ORDEM DE SERVIÇO
 * Garante que as peças voltem ao estoque antes de apagar a ordem.
 */
export async function deleteOrderAction(id: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.orderService.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!order) throw new Error("Ordem de Serviço não encontrada.");
      if (order.status === 'FINISHED') {
        throw new Error("Não é permitido excluir uma O.S. finalizada.");
      }

      // Estorno de estoque
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      await tx.orderService.delete({ where: { id } });
      return { success: true as const };
    });

    revalidatePath("/orders");
    revalidatePath("/products");
    return result;
  } catch (error: any) {
    return { success: false as const, error: error.message || "Erro ao excluir a ordem." };
  }
}