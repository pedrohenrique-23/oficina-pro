"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Criar (Já existente)
export async function createClientAction(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  if (!name || !phone) return { success: false, error: "Nome e Telefone são obrigatórios." };

  try {
    await prisma.client.create({
      data: { name, phone, email, address },
    });
    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao cadastrar cliente." };
  }
}

// Editar: Atualiza os dados do cliente
export async function updateClientAction(id: string, formData: FormData) {
  try {
    await prisma.client.update({
      where: { id },
      data: {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        address: formData.get("address") as string,
      },
    });
    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar cliente." };
  }
}

// Excluir: Protege a integridade referencial
export async function deleteClientAction(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });
    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: "Impossível excluir: este cliente possui motos ou ordens de serviço vinculadas." 
    };
  }
}