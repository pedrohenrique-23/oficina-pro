// src/app/clients/_components/create-client-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { createClientAction } from "@/app/actions/client-actions";

export function CreateClientModal() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createClientAction(formData);
    setIsPending(false);

    if (result.success) {
      setOpen(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 text-lg py-6 px-6">
          <UserPlus className="w-6 h-6" />
          Novo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Cliente</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          {/* Campos baseados no schema */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" name="name" placeholder="Ex: João da Silva" required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input id="phone" name="phone" placeholder="(00) 00000-0000" required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">E-mail (Opcional)</Label>
              <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
            </div>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" placeholder="Rua, Número, Bairro" />
          </div>

          <Button type="submit" className="w-full text-lg py-6" disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar Cliente"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}