"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Criar (Já existente)
export async function createMotorcycleAction(formData: FormData) {
  const plate = formData.get("plate") as string;
  const clientId = formData.get("clientId") as string;

  if (!plate || !clientId) return { success: false, error: "Placa e Cliente são obrigatórios." };

  try {
    await prisma.motorcycle.create({
      data: {
        plate: plate.toUpperCase(),
        clientId,
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        color: formData.get("color") as string,
        year: formData.get("year") ? Number(formData.get("year")) : undefined,
      },
    });
    revalidatePath("/motorcycles");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao cadastrar moto. Verifique se a placa já existe." };
  }
}

// Editar: Permite corrigir dados da moto ou transferir para outro cliente
export async function updateMotorcycleAction(id: string, formData: FormData) {
  try {
    await prisma.motorcycle.update({
      where: { id },
      data: {
        plate: (formData.get("plate") as string).toUpperCase(),
        brand: formData.get("brand") as string,
        model: formData.get("model") as string,
        color: formData.get("color") as string,
        year: formData.get("year") ? Number(formData.get("year")) : undefined,
        clientId: formData.get("clientId") as string,
      },
    });
    revalidatePath("/motorcycles");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar os dados da moto." };
  }
}

// Excluir: Garante a integridade referencial do sistema
export async function deleteMotorcycleAction(id: string) {
  try {
    await prisma.motorcycle.delete({
      where: { id },
    });
    revalidatePath("/motorcycles");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: "Impossível excluir: esta moto já possui Ordens de Serviço vinculadas." 
    };
  }
}