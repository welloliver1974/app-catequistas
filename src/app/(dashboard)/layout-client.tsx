"use client"

import { useState } from "react"
import { ViewTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  Church,
  Users,
  ClipboardCheck,
  BarChart3,
  CalendarDays,
  Bell,
  BookOpen,
  Database,
  FileText,
  Lightbulb,
  Download,
  Settings,
  LogOut,
  Bot,
  Menu,
  X,
  Phone,
  MessageCircle,
  Sun,
  Moon,
  Upload,
  WifiOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/actions/auth"
import { useTheme } from "@/lib/theme-provider"

interface User {
  name: string
  email: string
  role: string
}

interface NavItem {
  icon: any
  label: string
  href: string
}

interface NavGroup {
  titulo: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    titulo: "Geral",
    items: [
      { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
      { icon: ClipboardCheck, label: "Painel Admin", href: "/presenca" },
      { icon: CalendarDays, label: "Calendário", href: "/calendario" },
    ],
  },
  {
    titulo: "Catequese",
    items: [
      { icon: Church, label: "Encontros", href: "/encontros" },
      { icon: Users, label: "Catequistas", href: "/catequistas" },
      { icon: Phone, label: "Telefones", href: "/catequistas/telefones" },
      { icon: BookOpen, label: "Turmas", href: "/turmas" },
      { icon: WifiOff, label: "Chamada Offline", href: "/presenca/chamada" },
    ],
  },
  {
    titulo: "Pastoral & IA",
    items: [
      { icon: MessageCircle, label: "Mensagens Zap", href: "/mensagens" },
      { icon: Bot, label: "Assistente IA", href: "/assistente" },
      { icon: FileText, label: "Frequência", href: "/relatorios/frequencia" },
      { icon: FileText, label: "Relatório IA", href: "/relatorios/narrativo" },
      { icon: Lightbulb, label: "Temas Recorrentes", href: "/relatorios/temas" },
      { icon: Download, label: "Exportar", href: "/relatorios/exportar" },
    ],
  },
  {
    titulo: "Sistema",
    items: [
      { icon: Database, label: "Importar Planilha", href: "/importar" },
      { icon: Upload, label: "Importar Zap", href: "/catequistas/telefones/importar" },
      { icon: Bell, label: "Notificações", href: "/notificacoes" },
      { icon: Settings, label: "Configurações", href: "/configuracoes" },
    ],
  },
]

// Lista plana para referências de transição e atalhos rápidos
const navItems = navGroups.flatMap((g) => g.items)

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
  const { theme, toggleTheme } = useTheme()

  function isLinkAtivo(href: string) {
    if (href === "/presenca") {
      return pathname === "/presenca"
    }
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Desktop Sidebar aside */}
      <aside style={{ viewTransitionName: "app-sidebar" }} className="hidden md:flex w-64 border-r border-border/40 bg-card/50 flex-col shrink-0">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-border/40">
          <Church className="h-6 w-6 text-primary" />
          <span className="font-semibold">AppCatequistas</span>
        </div>
        <nav className="flex-1 p-3 space-y-3.5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.titulo} className="space-y-0.5">
              <p className="px-3 pb-1 text-[10px] font-bold tracking-wider text-muted-foreground/70 uppercase">
                {group.titulo}
              </p>
              {group.items.map((item) => {
                const isActive = isLinkAtivo(item.href)
                const currentIndex = navItems.findIndex((n) => isLinkAtivo(n.href))
                const itemIndex = navItems.findIndex((n) => n.href === item.href)
                const direction = itemIndex > currentIndex ? ["nav-forward"] : ["nav-back"]
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    transitionTypes={isActive ? undefined : direction}
                    className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-border/40 space-y-3">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
          </button>
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
      <nav style={{ viewTransitionName: "app-bottom-nav" }} className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-border/40 bg-card/90 backdrop-blur-md flex items-center justify-around z-40 px-2 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.1)]">
        {bottomNavItems.map((item) => {
          const isActive = isLinkAtivo(item.href)
          const currentIndex = bottomNavItems.findIndex((n) => isLinkAtivo(n.href))
          const itemIndex = bottomNavItems.findIndex((n) => n.href === item.href)
          const direction = itemIndex > currentIndex ? ["nav-forward"] : ["nav-back"]
          return (
            <Link
              key={item.href}
              href={item.href}
              transitionTypes={isActive ? undefined : direction}
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

              {/* Scrollable Items Categorized */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {navGroups.map((group) => (
                  <div key={group.titulo} className="space-y-2">
                    <p className="text-[11px] font-bold tracking-wider text-muted-foreground/80 uppercase px-1">
                      {group.titulo}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {group.items.map((item) => {
                        const isActive = isLinkAtivo(item.href)
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 ${
                              isActive
                                ? "bg-primary/15 border-primary/30 text-primary font-medium shadow-xs"
                                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <item.icon className="h-4 w-4 mb-1 text-muted-foreground group-hover:text-foreground" />
                            <span className="text-[10px] leading-tight font-medium">{item.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {/* Theme Toggle */}
                <div className="pt-2">
                  <button
                    onClick={() => { toggleTheme(); setIsMobileMenuOpen(false) }}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border/50 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === "dark" ? "Tema Claro" : "Tema Escuro"}
                  </button>
                </div>

                {/* Logout Action */}
                <div className="pt-3 border-t border-border/20">
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
        <ViewTransition name="page-content">
          {children}
        </ViewTransition>
      </main>
    </div>
  )
}
