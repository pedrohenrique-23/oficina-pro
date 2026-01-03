"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { updateClientAction } from "@/app/actions/client-actions";

export function EditClientModal({ client }: { client: any }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await updateClientAction(client.id, formData);
    setIsPending(false);

    if (result.success) setOpen(false);
    else alert(result.error);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-blue-600">
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente: {client.name}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" name="name" defaultValue={client.name} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input id="phone" name="phone" defaultValue={client.phone} required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" defaultValue={client.email || ""} />
            </div>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" defaultValue={client.address || ""} />
          </div>

          <Button type="submit" className="w-full py-6 text-lg" disabled={isPending}>
            {isPending ? "Salvando..." : "Atualizar Cadastro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}