"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/zod";

/**
 * 1. CRIAR PRODUTO
 */
export async function createProductAction(data: any) {
  const validatedFields = productSchema.safeParse(data);
  if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

  try {
    await prisma.product.create({ data: validatedFields.data });
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') return { success: false, error: "Este SKU já está em uso." };
    return { success: false, error: "Erro ao cadastrar o produto." };
  }
}

/**
 * 2. ATUALIZAR PRODUTO
 */
export async function updateProductAction(id: string, data: any) {
  const validatedFields = productSchema.safeParse(data);
  if (!validatedFields.success) return { success: false, error: "Dados inválidos." };

  try {
    await prisma.product.update({ where: { id }, data: validatedFields.data });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar o produto." };
  }
}

/**
 * 3. EXCLUIR PRODUTO (A peça que faltava)
 * Como você é de ADS, note a regra de integridade referencial aqui. [cite: 2025-07-15]
 */
export async function deleteProductAction(id: string) {
  try {
    // Engenharia de Software: verificamos se o produto já foi usado em alguma O.S. [cite: 2025-07-09]
    const hasHistory = await prisma.orderItem.findFirst({
      where: { productId: id }
    });

    if (hasHistory) {
      return { 
        success: false, 
        error: "Este produto não pode ser excluído pois está vinculado a Ordens de Serviço existentes." 
      };
    }

    await prisma.product.delete({ where: { id } });
    
    revalidatePath("/products");
    revalidatePath("/"); // Atualiza o Dashboard se houver métricas de estoque lá
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao tentar excluir o produto." };
  }
}