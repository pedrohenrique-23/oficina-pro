// src/app/clients/page.tsx
import { ClientService } from "@/services/client-service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, MapPin, Mail } from "lucide-react";
import { CreateClientModal } from "./_components/create-client-modal";

export default async function ClientsPage() {
  // Busca a lista de clientes
  const clients = await ClientService.getAll();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Gestão de Clientes
        </h1>
        {/* Componente de Modal para Cadastro */}
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
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Nenhum cliente cadastrado.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm space-y-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {client.phone}
                        </span>
                        {client.email && (
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      <div className="flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-1 shrink-0" />
                        <span>{client.address || "Não informado"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Futuramente: Botão para ver detalhes/motos do cliente */}
                      <button className="text-blue-600 hover:underline text-sm font-medium">
                        Ver Detalhes
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}