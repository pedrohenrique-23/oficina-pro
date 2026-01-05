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
import { EditProductModal } from "./_components/edit-product-modal";
import { DeleteProductButton } from "./_components/delete-product-button";

export default async function ProductsPage() {
  // 1. Buscamos os dados crus do Prisma
  const productsRaw = await ProductService.getAll();

  // 2. Corrigimos o erro de serialização do Decimal
  // Transformamos o objeto complexo Decimal em um Number comum do JS
  const products = productsRaw.map(product => ({
    ...product,
    price: Number(product.price), // Fix: Transforma Decimal em Number
    costPrice: product.costPrice ? Number(product.costPrice) : null, // Caso você use preço de custo
  }));

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
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const isLowStock = product.stock <= (product.minStock || 0);
                  
                  return (
                    <TableRow key={product.id} className={isLowStock ? "bg-red-50/50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className={isLowStock ? "text-red-700" : ""}>
                            {product.name}
                          </span>
                          {isLowStock && (
                            <span className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Repor
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.sku || "---"}
                      </TableCell>
                      <TableCell>
                        R$ {product.price.toFixed(2)}
                      </TableCell>
                      <TableCell className={`font-bold ${isLowStock ? "text-red-600" : ""}`}>
                        {product.stock} un.
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {/* Agora o modal recebe um Number plano e não dá erro */}
                        <EditProductModal product={product} />
                        <DeleteProductButton id={product.id} name={product.name} />
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