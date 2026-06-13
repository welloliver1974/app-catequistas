"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Church, Users, ClipboardCheck, BarChart3, CalendarDays, Bell, BookOpen, Database, FileText, Download, Settings, LogOut, Bot, Menu, X } from "lucide-react"
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
  { icon: FileText, label: "Relatório IA", href: "/relatorios/narrativo" },
  { icon: Download, label: "Exportar", href: "/relatorios/exportar" },
  { icon: ClipboardCheck, label: "Painel Admin", href: "/presenca" },
  { icon: CalendarDays, label: "Calendário", href: "/calendario" },
  { icon: Bot, label: "Assistente IA", href: "/assistente" },
  { icon: Database, label: "Importar", href: "/importar" },
  { icon: Bell, label: "Notificações", href: "/notificacoes" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
]

const bottomNavItems = [
  { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
  { icon: Church, label: "Encontros", href: "/encontros" },
  { icon: Users, label: "Catequistas", href: "/catequistas" },
  { icon: ClipboardCheck, label: "Admin", href: "/presenca" },
]

export function DashboardLayoutClient({
  children,
  user,
}: {
  children: React.ReactNode
  user: User | null
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Desktop Sidebar aside */}
      <aside className="hidden md:flex w-64 border-r border-border/40 bg-card/50 flex-col shrink-0">
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

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border/40 bg-card/90 backdrop-blur-md flex items-center justify-around z-40 px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] transition-colors ${
                isActive ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] transition-colors border-none bg-transparent ${
            isMobileMenuOpen ? "text-primary font-medium" : "text-muted-foreground"
          }`}
        >
          <Menu className="h-5 w-5 mb-1" />
          <span>Mais</span>
        </button>
      </nav>

      {/* Mobile Bottom Sheet Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="md:hidden fixed bottom-0 left-0 right-0 max-h-[85vh] bg-card border-t border-border/50 rounded-t-2xl z-50 flex flex-col pb-8 pt-4 overflow-hidden shadow-2xl"
            >
              {/* Drag Handle */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 shrink-0" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-4 border-b border-border/20 shrink-0">
                <div>
                  <h3 className="font-semibold text-foreground">Menu Principal</h3>
                  {user && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user.name} • <span className="capitalize">{user.role.toLowerCase()}</span>
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Items Grid */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-3 gap-3">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 border-primary/20 text-primary font-medium"
                            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <item.icon className="h-5 w-5 mb-1.5 text-muted-foreground group-hover:text-foreground" />
                        <span className="text-[10px] leading-tight font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>

                {/* Logout Action */}
                <div className="mt-6 pt-5 border-t border-border/20">
                  <form action={logoutAction} onSubmit={() => setIsMobileMenuOpen(false)}>
                    <Button type="submit" variant="destructive" className="w-full gap-2 text-xs h-10">
                      <LogOut className="h-4 w-4" />
                      Sair da Conta
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
