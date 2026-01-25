"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  Users, 
  Bike, 
  Wrench,
  Settings,
  ShoppingCart // 🚀 Novo ícone para Vendas
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Ordens de Serviço", href: "/orders", icon: ClipboardList },
  { name: "Venda de Balcão", href: "/sales/new", icon: ShoppingCart }, // 🛒 Nova Rota
  { name: "Estoque", href: "/products", icon: Package },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Motos", href: "/motorcycles", icon: Bike },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 shadow-xl print:hidden">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wrench className="text-blue-400" /> Oficina Pro
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Gestão de Serviços</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          // 🧠 Lógica de active: destaca se o pathname começar com o href (útil para sub-rotas)
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"
              )} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Configurações</span>
        </div>
      </div>
    </div>
  );
}