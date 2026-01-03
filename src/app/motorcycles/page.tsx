// src/app/motorcycles/page.tsx
import { MotorcycleService } from "@/services/motorcycle-service";
import { ClientService } from "@/services/client-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike, User } from "lucide-react";
import { CreateMotorcycleModal } from "./_components/create-motorcycle-modal";
import { EditMotorcycleModal } from "./_components/edit-motorcycle-modal";
import { DeleteMotorcycleButton } from "./_components/delete-motorcycle-button"; //

export default async function MotorcyclesPage() {
  const [motorcycles, clients] = await Promise.all([
    MotorcycleService.getAll(),
    ClientService.getAll()
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Bike className="w-8 h-8" /> Frota de Motos
        </h1>
        <CreateMotorcycleModal clients={clients} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Motos e Proprietários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo / Marca</TableHead>
                <TableHead>Proprietário</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motorcycles.map((moto) => (
                <TableRow key={moto.id}>
                  <TableCell className="font-bold text-blue-700 tracking-widest uppercase">
                    {moto.plate}
                  </TableCell>
                  <TableCell>
                    {moto.brand} {moto.model} 
                    {moto.year && <span className="text-muted-foreground text-xs ml-1">({moto.year})</span>}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {moto.client.name}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right space-x-2">
                    <EditMotorcycleModal moto={moto} clients={clients} />
                    {/* Usamos o componente de cliente para evitar conflitos de renderização */}
                    <DeleteMotorcycleButton id={moto.id} plate={moto.plate} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}