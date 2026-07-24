"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Church, CheckCircle2, XCircle, Clock, User, MessageSquareText, BarChart3, CalendarDays, Search, Phone, Lock, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { getHistoricoCatequista, verificarTelefone } from "@/actions/catequista-publico"

interface Catequista {
  id: string
  nome: string
}

interface Props {
  catequistas: Catequista[]
  muralInicial: string
}

type Etapa = "selecao" | "telefone" | "historico"

export function HistoricoClient({ catequistas, muralInicial }: Props) {
  const [selectedId, setSelectedId] = useState("")
  const [selectedNome, setSelectedNome] = useState("")
  const [telefone, setTelefone] = useState("")
  const [etapa, setEtapa] = useState<Etapa>("selecao")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  const [mostrarTel, setMostrarTel] = useState(false)

  async function handleSelectCatequista(id: string) {
    setSelectedId(id)
    setTelefone("")
    setError(null)
    setStats(null)
    setHistorico([])
    if (!id) {
      setEtapa("selecao")
      return
    }
    const c = catequistas.find((c) => c.id === id)
    setSelectedNome(c?.nome || "")
    setEtapa("telefone")
  }

  async function handleVerificarTelefone() {
    if (!telefone.trim()) {
      setError("Digite seu telefone.")
      return
    }
    setLoading(true)
    setError(null)
    const res = await verificarTelefone(selectedId, telefone)
    if (!res.valido) {
      setError(res.error || "Telefone incorreto.")
      setLoading(false)
      return
    }
    // Telefone OK, carrega histórico
    const result = await getHistoricoCatequista(selectedId, telefone)
    if ("error" in result) {
      setError(result.error || "Erro ao carregar histórico.")
      setLoading(false)
      return
    }
    setStats(result.stats)
    setHistorico(result.historico)
    setEtapa("historico")
    setLoading(false)
  }

  function handleVoltar() {
    setEtapa("selecao")
    setSelectedId("")
    setTelefone("")
    setError(null)
    setStats(null)
    setHistorico([])
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

        {/* Etapa 1: Seletor de nome */}
        {etapa === "selecao" && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Selecione seu nome
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={selectedId}
                onChange={(e) => handleSelectCatequista(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Selecione...</option>
                {catequistas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Etapa 2: Verificação de telefone */}
        {etapa === "telefone" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/30">
              <Lock className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Verificação de identidade</p>
                <p className="text-xs text-muted-foreground">
                  Digite seu telefone cadastrado para acessar o histórico de <strong>{selectedNome}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Seu telefone
              </label>
              <div className="relative">
                <input
                  type={mostrarTel ? "text" : "password"}
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleVerificarTelefone()}
                  placeholder="(11) 99999-9999"
                  className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarTel(!mostrarTel)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarTel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                {error}
              </motion.p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleVoltar}
                className="flex-1 h-11 rounded-xl border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleVerificarTelefone}
                disabled={loading || !telefone.trim()}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verificando..." : "Acessar Histórico"}
              </button>
            </div>
          </motion.div>
        )}

        {/* Etapa 3: Histórico */}
        {etapa === "historico" && stats && (
          <>
            {/* Botão voltar */}
            <button
              onClick={handleVoltar}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {selectedNome} (trocar)
            </button>

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

            {historico.length > 0 && (
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
                            {item.justificativa && <span className="text-muted-foreground font-normal">: {item.justificativa}</span>}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {historico.length === 0 && (
              <div className="text-center py-12 text-muted-foreground space-y-2">
                <Clock className="h-8 w-8 mx-auto opacity-30" />
                <p className="text-sm">Nenhum registro de presença encontrado.</p>
              </div>
            )}
          </>
        )}

        {/* Erro na tela de histórico */}
        {error && etapa === "historico" && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-600">
            {error}
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
