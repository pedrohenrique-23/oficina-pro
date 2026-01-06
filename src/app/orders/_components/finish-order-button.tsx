"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, DollarSign } from "lucide-react";
import { finishOrderAction } from "@/app/actions/order-actions";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { PaymentMethod } from "@prisma/client";

export function FinishOrderButton({ id, orderNumber }: { id: string, orderNumber: string }) {
  const [isPending, setIsPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("CASH");

  async function handleFinish() {
    setIsPending(true);
    const result = await finishOrderAction(id, method);
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
        <Button 
          variant="outline" 
          size="sm" 
          className="text-green-600 border-green-200 hover:bg-green-50 gap-1 font-bold"
        >
          <CheckCircle2 className="w-4 h-4" /> Finalizar
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Finalizar O.S. #{orderNumber}
          </DialogTitle>
          <DialogDescription>
            Confirme como o cliente realizou o pagamento para encerrar esta ordem e atualizar o caixa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-tighter">
              Forma de Pagamento
            </label>
            <Select 
              value={method} 
              onValueChange={(val: PaymentMethod) => setMethod(val)}
            >
              <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Dinheiro</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="DEBIT">Cartão de Débito</SelectItem>
                <SelectItem value="CREDIT">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            Voltar
          </Button>
          <Button 
            onClick={handleFinish} 
            disabled={isPending} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Recebimento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}