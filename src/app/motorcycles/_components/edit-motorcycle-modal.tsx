"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Bike } from "lucide-react";
import { updateMotorcycleAction } from "@/app/actions/motorcycle-actions";

export function EditMotorcycleModal({ moto, clients }: { moto: any, clients: any[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await updateMotorcycleAction(moto.id, formData);
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
          <DialogTitle className="flex items-center gap-2">
            <Bike className="w-5 h-5" /> Editar Moto: {moto.plate}
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="clientId">Proprietário (Dono)</Label>
            <select 
              id="clientId" 
              name="clientId" 
              defaultValue={moto.clientId}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="plate">Placa</Label>
              <Input id="plate" name="plate" defaultValue={moto.plate} required />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="year">Ano</Label>
              <Input id="year" name="year" type="number" defaultValue={moto.year || ""} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" name="brand" defaultValue={moto.brand || ""} />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="model">Modelo</Label>
              <Input id="model" name="model" defaultValue={moto.model || ""} />
            </div>
          </div>

          <Button type="submit" className="w-full py-6 text-lg" disabled={isPending}>
            {isPending ? "Atualizando..." : "Salvar Alterações"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}