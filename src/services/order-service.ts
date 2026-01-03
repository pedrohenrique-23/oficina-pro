// src/services/order-service.ts
import prisma from "@/lib/prisma";

export const OrderService = {
  // Procura todas as ordens com os relacionamentos necessários
  async getAll() {
    return await prisma.orderService.findMany({
      include: {
        client: true,
        motorcycle: true,
      },
      orderBy: {
        createdAt: 'desc', // As mais recentes aparecem primeiro
      },
    });
  },

  // Procura apenas as ordens que não foram finalizadas/pagas (para o dashboard)
  async getOpenOrders() {
    return await prisma.orderService.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        }
      },
      include: {
        client: true,
        motorcycle: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
};