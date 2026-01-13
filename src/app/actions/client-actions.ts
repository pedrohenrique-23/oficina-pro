"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Função utilitária para limpar o cache das rotas dependentes
 * Isso garante que o cliente apareça em Dropdowns e Tabelas
 */
function revalidateClientRoutes() {
  revalidatePath("/clients");
  revalidatePath("/motorcycles");
  revalidatePath("/orders/new");
  revalidatePath("/orders"); // Opcional: para atualizar filtros no dashboard de ordens
}

// 1. Criar Cliente
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
    
    // Dispara a revalidação em cascata
    revalidateClientRoutes();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao cadastrar cliente." };
  }
}

// 2. Editar Cliente
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
    
    // Revalida pois a alteração do nome deve refletir nos selects de outras telas
    revalidateClientRoutes();
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar cliente." };
  }
}

// 3. Excluir Cliente
export async function deleteClientAction(id: string) {
  try {
    await prisma.client.delete({
      where: { id },
    });
    
    revalidateClientRoutes();
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: "Impossível excluir: este cliente possui motos ou ordens de serviço vinculadas." 
    };
  }
}