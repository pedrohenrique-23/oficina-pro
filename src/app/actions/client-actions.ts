"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Função utilitária para limpar o cache das rotas dependentes.
 * Isso garante que o cliente apareça em Dropdowns e Tabelas imediatamente.
 */
function revalidateClientRoutes() {
  revalidatePath("/clients");
  revalidatePath("/motorcycles");
  revalidatePath("/orders/new");
  revalidatePath("/orders"); 
}

// 1. Criar Cliente
export async function createClientAction(formData: FormData) {
  // Captura dos dados do formulário
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  // Validação básica de segurança
  if (!name || !phone) {
    return { success: false, error: "Nome e Telefone são obrigatórios." };
  }

  try {
    // O console.log em Server Actions aparece no terminal (local) ou no log da Vercel (produção)
    console.log("Tentando criar cliente no banco:", { name, phone });

    const newClient = await prisma.client.create({
      data: { name, phone, email, address },
    });
    
    console.log("Cliente criado com sucesso. ID:", newClient.id);

    revalidateClientRoutes();
    return { success: true };

  } catch (error: any) {
    // ESTA É A PARTE MAIS IMPORTANTE:
    // Sem este console.error, a Vercel não registra o erro técnico do Prisma.
    console.error("ERRO FATAL NO PRISMA AO CRIAR CLIENTE:", error);

    // Retornamos uma mensagem amigável para o front-end, 
    // mas o log acima terá os detalhes técnicos (ex: senha errada, campo faltando).
    return { 
      success: false, 
      error: error.message || "Erro interno ao cadastrar cliente." 
    };
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
    
    revalidateClientRoutes();
    return { success: true };
  } catch (error) {
    console.error("ERRO AO ATUALIZAR CLIENTE:", error);
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
    console.error("ERRO AO EXCLUIR CLIENTE:", error);
    return { 
      success: false, 
      error: "Impossível excluir: este cliente possui motos ou ordens de serviço vinculadas." 
    };
  }
}