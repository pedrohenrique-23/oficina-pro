"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 1. CRIAR ORDEM DE SERVIÇO
 * Calcula o total com Mão de Obra e baixa o estoque inicial.
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
      // Cálculo: Total = Σ (Peças) + Mão de Obra
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

      // Baixa o estoque de cada peça utilizada
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
 * 2. ATUALIZAR ORDEM DE SERVIÇO (RECONCILIAÇÃO)
 * Devolve itens antigos ao estoque, deleta-os e aplica a nova configuração.
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
      // Busca a O.S. atual para saber o que devolver ao estoque
      const oldOrder = await tx.orderService.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!oldOrder) throw new Error("Ordem de Serviço não encontrada.");
      if (oldOrder.status === 'FINISHED') throw new Error("O.S. finalizada não pode ser editada.");

      // Passo A: Estornar estoque das peças antigas
      for (const item of oldOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }

      // Passo B: Remover vínculos antigos
      await tx.orderItem.deleteMany({ where: { orderServiceId: id } });

      // Passo C: Calcular novo total
      const itemsTotal = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
      const finalTotal = itemsTotal + data.laborValue;

      // Passo D: Atualizar dados da O.S. e criar novos itens
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

      // Passo E: Baixar novo estoque
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
 * 3. FINALIZAR ORDEM DE SERVIÇO
 * Trava a edição para garantir integridade financeira.
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
    return { success: false, error: "Erro ao finalizar a ordem." };
  }
}

/**
 * 4. EXCLUIR ORDEM DE SERVIÇO
 * Proteção contra exclusão de histórico concluído.
 */
export async function deleteOrderAction(id: string) {
  try {
    const order = await prisma.orderService.findUnique({ where: { id } });
    
    if (order?.status === 'FINISHED') {
      return { success: false, error: "Regra de Negócio: Não é permitido excluir uma O.S. finalizada." };
    }

    // Nota: Os itens serão deletados automaticamente se configurado 'onDelete: Cascade' no Prisma
    await prisma.orderService.delete({ where: { id } });
    revalidatePath("/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao tentar excluir a ordem." };
  }
}