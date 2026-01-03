"use server"; // Indica que este código roda apenas no servidor

import { revalidatePath } from "next/cache";
import { ProductService } from "@/services/product-service";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Schema de validação: Garante que os dados estão corretos antes de tocar o DB
const productSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  sku: z.string().optional(),
  price: z.coerce.number().min(0.01, "O preço deve ser maior que zero"),
  costPrice: z.coerce.number().min(0.01, "O preço de custo deve ser maior que zero"),
  stock: z.coerce.number().int().min(0, "O estoque não pode ser negativo"),
});

export async function createProductAction(formData: FormData) {
  // Extrai os dados do formulário
  const rawData = Object.fromEntries(formData.entries());
  
  // Valida os dados com o Zod
  const validatedData = productSchema.parse(rawData);

  try {
    await ProductService.create(validatedData);
    
    // Limpa o cache da página de produtos para mostrar o novo item
    revalidatePath("/products");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { success: false, error: "Falha ao salvar o produto" };
  }
}

// Ação para Excluir
export async function deleteProductAction(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Não é possível excluir um produto que já está vinculado a uma Ordem de Serviço." };
  }
}

// Ação para Editar
export async function updateProductAction(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const minStock = Number(formData.get("minStock"));

  try {
    await prisma.product.update({
      where: { id },
      data: {
        name,
        sku: formData.get("sku") as string,
        price,
        stock,
        minStock,
      }
    });
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar o produto." };
  }
}