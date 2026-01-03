// src/app/motorcycles/_components/create-motorcycle-modal.tsx
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
import { Bike, Plus } from "lucide-react";
import { createMotorcycleAction } from "@/app/actions/motorcycle-actions";

interface ClientOption {
  id: string;
  name: string;
}

export function CreateMotorcycleModal({ clients }: { clients: ClientOption[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await createMotorcycleAction(formData);
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
          <Plus className="w-6 h-6" />
          Cadastrar Moto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bike className="w-5 h-5" />
            Nova Moto no Sistema
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="clientId">Proprietário (Dono)</Label>
            <select 
              id="clientId" 
              name="clientId" 
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selecione o dono da moto...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" name="plate" placeholder="ABC1234" required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="year">Ano (Opcional)</Label>
              <Input id="year" name="year" type="number" placeholder="2024" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" placeholder="Ex: Honda" />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" name="model" placeholder="Ex: CG 160 Titan" />
            </div>
          </div>

          <Button type="submit" className="w-full text-lg py-6" disabled={isPending}>
            {isPending ? "Vinculando..." : "Confirmar Cadastro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}