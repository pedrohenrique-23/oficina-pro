// src/services/motorcycle-service.ts
import prisma from "@/lib/prisma";

export const MotorcycleService = {
  // Busca motos incluindo o nome do dono
  async getAll() {
    return await prisma.motorcycle.findMany({
      include: { client: true },
      orderBy: { plate: 'asc' },
    });
  },

  async create(data: { 
    plate: string; 
    brand?: string; 
    model?: string; 
    color?: string; 
    year?: number; 
    clientId: string 
  }) {
    return await prisma.motorcycle.create({ data });
  }
};