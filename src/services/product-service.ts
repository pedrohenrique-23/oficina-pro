import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const ProductService = {
  /**
   * Lista todos os produtos ordenados pelo nome.
   */
  async getAll() {
    return await prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Cria um novo produto no estoque.
   */
  async create(data: {
    name: string;
    sku?: string;
    description?: string;
    price: number;
    costPrice: number;
    stock: number;
    minStock?: number;
  }) {
    return await prisma.product.create({
      data: {
        ...data,
        // O Prisma/PostgreSQL exige o tipo Decimal para campos financeiros
        price: new Prisma.Decimal(data.price),
        costPrice: new Prisma.Decimal(data.costPrice),
      },
    });
  },

  /**
   * Busca um produto pelo SKU (Código de Barras) - Essencial para seus pais!
   */
  async getBySku(sku: string) {
    return await prisma.product.findUnique({
      where: { sku },
    });
  },

  /**
   * Atualiza a quantidade em estoque (Entrada/Saída)
   */
  async updateStock(id: string, newStock: number) {
    return await prisma.product.update({
      where: { id },
      data: { stock: newStock },
    });
  }
};