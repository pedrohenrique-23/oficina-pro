"use server"; // Indica que este código roda apenas no servidor

import { revalidatePath } from "next/cache";
import { ProductService } from "@/services/product-service";
import { z } from "zod";

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