import { ProductService } from "@/services/product-service";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageSearch, AlertTriangle } from "lucide-react";
import { CreateProductModal } from "./_components/create-product-modal";

export default async function ProductsPage() {
  // Busca os produtos diretamente do servidor via Prisma
  const products = await ProductService.getAll();

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <PackageSearch className="w-8 h-8" />
          Controle de Estoque
        </h1>
        {/* Modal de cadastro de novos produtos */}
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
                <TableHead className="text-right">Qtd. em Estoque</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    Nenhum produto cadastrado ainda.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  // Lógica de Negócio: Verifica se o estoque atingiu o nível crítico definido no banco
                  const isLowStock = product.stock <= product.minStock;

                  return (
                    <TableRow 
                      key={product.id}
                      className={isLowStock ? "bg-red-50/50 hover:bg-red-100/50 transition-colors" : ""}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className={isLowStock ? "text-red-700" : ""}>
                            {product.name}
                          </span>
                          {isLowStock && (
                            <span className="flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              Repor Estoque (Mínimo: {product.minStock})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.sku || "---"}
                      </TableCell>
                      <TableCell>
                        R$ {Number(product.price).toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-bold text-lg ${isLowStock ? "text-red-600" : "text-green-700"}`}>
                        {product.stock} un.
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}