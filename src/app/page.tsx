import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ClipboardList, Wrench, Package, Banknote, QrCode, CreditCard } from "lucide-react";
import Image from 'next/image';

export default async function DashboardPage() {
  // 1. Busca ordens finalizadas com os novos campos de pagamento
  const orders = await prisma.orderService.findMany({
    where: { status: 'FINISHED' },
  });

  // 2. Cálculos Gerais (Baseados em ADS: High Performance)
  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.totalValue), 0);
  const totalLabor = orders.reduce((acc, o) => acc + Number(o.laborValue), 0);
  const totalParts = totalRevenue - totalLabor;

  // 3. Agrupamento por Meio de Pagamento
  const byMethod = orders.reduce((acc, o) => {
    const method = o.paymentMethod || "CASH";
    acc[method] = (acc[method] || 0) + Number(o.totalValue);
    return acc;
  }, {} as Record<string, number>);

  const mainStats = [
    { name: "Faturamento Total", value: totalRevenue, icon: DollarSign, color: "text-green-600" },
    { name: "Serviços Concluídos", value: orders.length, icon: ClipboardList, color: "text-blue-600" },
    { name: "Total Mão de Obra", value: totalLabor, icon: Wrench, color: "text-amber-600" },
    { name: "Total em Peças", value: totalParts, icon: Package, color: "text-purple-600" },
  ];

  const paymentStats = [
    { name: "Dinheiro (Espécie)", value: byMethod.CASH || 0, icon: Banknote, color: "text-emerald-500" },
    { name: "PIX", value: byMethod.PIX || 0, icon: QrCode, color: "text-cyan-500" },
    { name: "Cartão de Débito", value: byMethod.DEBIT || 0, icon: CreditCard, color: "text-slate-600" },
    { name: "Cartão de Crédito", value: byMethod.CREDIT || 0, icon: CreditCard, color: "text-orange-500" },
  ];

  return (
    <div className="p-8 space-y-10">
      <header>
        <Image 
        src="/logo.png" // Caminho dentro da pasta public
        alt="Logo Oficina Pro"
        width={300}             // Largura definida em pixels
        height={300}              // Altura definida em pixels
        className="mx-auto block"
        priority                // Carrega a imagem com prioridade (bom para logos)
      />
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Dashboard Oficina Pro</h1>
        <p className="text-muted-foreground font-medium">Análise de faturamento e fluxo de caixa.</p>
      </header>

      {/* Seção 1: Métricas Gerais */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Desempenho Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainStats.map((stat) => (
            <Card key={stat.name} className="border-none shadow-md bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-[10px] font-black uppercase text-slate-500">{stat.name}</CardTitle>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-slate-900">
                  {stat.name === "Serviços Concluídos" ? stat.value : `R$ ${stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Seção 2: Resumo Financeiro por Método */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase text-slate-400 tracking-widest">Recebimentos por Método</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paymentStats.map((stat) => (
            <Card key={stat.name} className="border-slate-100 shadow-sm">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <CardTitle className="text-[10px] font-bold uppercase text-slate-400">{stat.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-slate-700">
                  R$ {stat.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}