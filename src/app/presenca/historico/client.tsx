"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Church, CheckCircle2, XCircle, Clock, User, MessageSquareText, BarChart3, CalendarDays, Search } from "lucide-react"
import Link from "next/link"
import { getHistoricoCatequista } from "@/actions/catequista-publico"

interface Catequista {
  id: string
  nome: string
}

interface Props {
  catequistas: Catequista[]
  muralInicial: string
}

export function HistoricoClient({ catequistas, muralInicial }: Props) {
  const [selectedId, setSelectedId] = useState("")
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{
    total: number
    presentes: number
    ausentes: number
    totalEncontros: number
    frequencia: number
  } | null>(null)
  const [historico, setHistorico] = useState<{
    tema: string
    data: string
    presente: boolean
    justificativa: string | null
  }[]>([])
  const [mural] = useState(muralInicial)
  const [mostrarMural, setMostrarMural] = useState(false)

  async function handleSelect(id: string) {
    setSelectedId(id)
    if (!id) {
      setStats(null)
      setHistorico([])
      return
    }
    setLoading(true)
    const data = await getHistoricoCatequista(id)
    setStats(data.stats)
    setHistorico(data.historico)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 bg-card/50">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Church className="h-6 w-6 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold truncate">App Catequistas</h1>
            <p className="text-xs text-muted-foreground">Meu Histórico</p>
          </div>
          <Link href="/presenca/confirmar" className="text-xs text-primary hover:underline shrink-0">
            Confirmar Presença
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Mural de avisos */}
        {mural && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-primary/5 border border-primary/20"
          >
            <div className="flex items-start gap-3">
              <MessageSquareText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{mural}</div>
            </div>
          </motion.div>
        )}

        {/* Seletor de catequista */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Selecione seu nome
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={selectedId}
              onChange={(e) => handleSelect(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Selecione...</option>
              {catequistas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}

        {/* Stats */}
        {stats && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { label: "Encontros", value: stats.totalEncontros, icon: CalendarDays, color: "text-foreground" },
              { label: "Participou", value: stats.total, icon: BarChart3, color: "text-foreground" },
              { label: "Presenças", value: stats.presentes, icon: CheckCircle2, color: "text-primary" },
              { label: "Frequência", value: `${stats.frequencia}%`, icon: Church, color: stats.frequencia >= 70 ? "text-primary" : "text-yellow-500" },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center space-y-1"
                >
                  <Icon className={`h-4 w-4 mx-auto ${item.color}`} />
                  <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Histórico */}
        {stats && !loading && historico.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/30 overflow-hidden"
          >
            <div className="divide-y divide-border/20">
              {historico.map((item, i) => (
                <motion.div
                  key={`${item.data}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.tema}</p>
                    <p className="text-xs text-muted-foreground">{item.data}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.presente ? (
                      <span className="flex items-center gap-1 text-primary text-xs font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Presente
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                        <XCircle className="h-3.5 w-3.5" /> Ausente
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vazio */}
        {selectedId && stats && !loading && historico.length === 0 && (
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <Clock className="h-8 w-8 mx-auto opacity-30" />
            <p className="text-sm">Nenhum registro de presença encontrado.</p>
          </div>
        )}

        {/* Rodapé */}
        <p className="text-xs text-center text-muted-foreground pt-4">
          <Link href="https://catequistas.housecloud.tec.br" className="hover:underline">App Catequistas</Link> — Controle de Presença
        </p>
      </main>
    </div>
  )
}
