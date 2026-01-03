// src/services/client-service.ts
import prisma from "@/lib/prisma";

export const ClientService = {
  // Busca todos os clientes ordenados por nome
  async getAll() {
    return await prisma.client.findMany({
      orderBy: { name: 'asc' },
    });
  },

  // Busca um cliente específico com suas motos
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