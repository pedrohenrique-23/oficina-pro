// src/services/client-service.ts
import prisma from "@/lib/prisma";

export const ClientService = {
  // Busca todos os clientes incluindo suas motos para o formulário de O.S.
  async getAll() {
    return await prisma.client.findMany({
      include: {
        motorcycles: true, // Traz a lista de motos de cada cliente
      },
      orderBy: { name: 'asc' },
    });
  },

  // Busca um cliente específico
  async getById(id: string) {
    return await prisma.client.findUnique({
      where: { id },
      include: { motorcycles: true },
    });
  },

  // Cria um novo cliente
  async create(data: { name: string; phone: string; email?: string; address?: string }) {
    return await prisma.client.create({
      data,
    });
  }
};