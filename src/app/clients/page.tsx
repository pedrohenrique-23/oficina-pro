import { ClientService } from "@/services/client-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, Mail } from "lucide-react";
import { CreateClientModal } from "./_components/create-client-modal";
import { EditClientModal } from "./_components/edit-client-modal";
import { DeleteClientButton } from "./_components/delete-client-button";

export default async function ClientsPage() {
  const clients = await ClientService.getAll();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" /> Gestão de Clientes
        </h1>
        <CreateClientModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm space-y-1">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {client.phone}</span>
                      {client.email && <span className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" /> {client.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {client.address || "---"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <EditClientModal client={client} />
                    <DeleteClientButton id={client.id} name={client.name} />
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