// src/app/actions/client-actions.ts
"use server";

import { ClientService } from "@/services/client-service";
import { revalidatePath } from "next/cache";

export async function createClientAction(formData: FormData) {
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;
  const address = formData.get("address") as string;

  if (!name || !phone) {
    return { success: false, error: "Nome e Telefone são obrigatórios." };
  }

  try {
    await ClientService.create({ name, phone, email, address });
    revalidatePath("/clients"); // Atualiza a lista de clientes
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao cadastrar cliente." };
  }
}