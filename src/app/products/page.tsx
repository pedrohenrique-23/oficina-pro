import { ProductService } from "@/services/product-service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageSearch, AlertTriangle, Trash2 } from "lucide-react";
import { CreateProductModal } from "./_components/create-product-modal";
import { EditProductModal } from "./_components/edit-product-modal"; // Novo
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/app/actions/product-actions"; // Novo

export default async function ProductsPage() {
  const products = await ProductService.getAll();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PackageSearch className="w-8 h-8" />
          Controle de Estoque
        </h1>
        <CreateProductModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Peças e Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>SKU/Código</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Qtd. Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead> {/* Nova Coluna */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                return (
                  <TableRow key={product.id} className={isLowStock ? "bg-red-50/50" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className={isLowStock ? "text-red-700" : ""}>{product.name}</span>
                        {isLowStock && <span className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Repor</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.sku || "---"}</TableCell>
                    <TableCell>R$ {Number(product.price).toFixed(2)}</TableCell>
                    <TableCell className={`font-bold ${isLowStock ? "text-red-600" : ""}`}>{product.stock} un.</TableCell>
                    
                    {/* Botões de Ação */}
                    <TableCell className="text-right space-x-2">
                      <EditProductModal product={product} />
                      <form action={async () => { 
                        "use server"; 
                        if(confirm(`Excluir ${product.name}?`)) await deleteProductAction(product.id); 
                      }} className="inline">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}