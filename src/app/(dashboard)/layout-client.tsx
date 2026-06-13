"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Church, Users, ClipboardCheck, BarChart3, CalendarDays, Bell, BookOpen, Database, FileText, Download, Settings, LogOut, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth"

interface User {
  name: string
  email: string
  role: string
}

const navItems = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
  { icon: Church, label: "Encontros", href: "/encontros" },
  { icon: Users, label: "Catequistas", href: "/catequistas" },
  { icon: BookOpen, label: "Turmas", href: "/turmas" },
  { icon: FileText, label: "Frequência", href: "/relatorios/frequencia" },
  { icon: Download, label: "Exportar", href: "/relatorios/exportar" },
  { icon: ClipboardCheck, label: "Painel Admin", href: "/presenca" },
  { icon: CalendarDays, label: "Calendário", href: "/calendario" },
  { icon: Bot, label: "Assistente IA", href: "/assistente" },
  { icon: Database, label: "Importar", href: "/importar" },
  { icon: Bell, label: "Notificações", href: "/notificacoes" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

export function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode
  user: User | null
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border/40 bg-card/50 flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-border/40">
          <Church className="h-6 w-6 text-primary" />
          <span className="font-semibold">AppCatequistas</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border/40 space-y-3">
          {user && (
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
            </div>
          )}
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
