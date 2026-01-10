import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  price: z.coerce.number().positive("O preço deve ser maior que zero"),
  costPrice: z.coerce.number().positive("O preço de custo deve ser maior que zero"),
  stock: z.coerce.number().int().min(0, "O estoque não pode ser negativo"),
  minStock: z.coerce.number().int().min(0, "O estoque mínimo não pode ser negativo"),
  sku: z.string().optional(),
  description: z.string().optional(),
});