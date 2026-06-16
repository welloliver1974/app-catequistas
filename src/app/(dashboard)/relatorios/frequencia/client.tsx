"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart3, Users, AlertTriangle, Download, CheckCircle2, XCircle, Sparkles, Loader2, Copy, Check, AlertCircle, CalendarDays, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { PresencaRow, CatequistaFreq, PresencaEncontroRow } from "@/actions/relatorios"

type Tab = "individual" | "turma" | "baixa" | "encontro" | "analise_ia"

interface Props {
  catequistas: { id: string; nome: string }[]
  turmas: { id: string; nome: string }[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

function PercentBar({ value }: { value: number }) {
  const color =
    value >= 75 ? "bg-primary" : value >= 50 ? "bg-yellow-500" : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-medium w-10 text-right">{value}%</span>
    </div>
  )
}

export function FrequenciaClient({ catequistas, turmas }: Props) {
  const [tab, setTab] = useState<Tab>("individual")

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Relatórios de Frequência <span className="text-[10px] text-muted-foreground font-normal font-sans">v2</span></h1>
      </header>

      <div className="p-4 sm:p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setTab("individual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              tab === "individual"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Individual
          </button>
          <button
            onClick={() => setTab("turma")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              tab === "turma"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Users className="h-4 w-4" />
            Por Turma
          </button>
          <button
            onClick={() => setTab("baixa")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              tab === "baixa"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Baixa Frequência
          </button>
          <button
            onClick={() => setTab("encontro")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              tab === "encontro"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Por Encontro
          </button>
          <button
            onClick={() => setTab("analise_ia")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0 ${
              tab === "analise_ia"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500/20" />
            Análise IA
          </button>
        </div>

        {tab === "individual" && <IndividualView catequistas={catequistas} />}
        {tab === "turma" && <TurmaView turmas={turmas} />}
        {tab === "baixa" && <BaixaView />}
        {tab === "encontro" && <EncontroView />}
        {tab === "analise_ia" && <IaView />}
      </div>
    </>
  )
}

function IndividualView({ catequistas }: { catequistas: { id: string; nome: string }[] }) {
  const [catequistaId, setCatequistaId] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    nome: string
    turmas: string
    total: number
    presentes: number
    percentual: number
    presencas: PresencaRow[]
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!catequistaId) return
    setLoading(true)
    const { getRelatorioIndividual } = await import("@/actions/relatorios")
    const res = await getRelatorioIndividual(catequistaId, dataInicio || undefined, dataFim || undefined)
    setResultado(res)
    setLoading(false)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Frequência Individual</CardTitle>
        <CardDescription>Selecione um catequista e período para ver o relatório.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="catequista">Catequista</Label>
              <Select value={catequistaId} onValueChange={setCatequistaId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {catequistas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data início</Label>
              <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data fim</Label>
              <Input id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Carregando..." : "Gerar Relatório"}
          </Button>
        </form>

        {resultado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{resultado.total}</p>
                <p className="text-xs text-muted-foreground">Total Encontros</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold text-primary">{resultado.presentes}</p>
                <p className="text-xs text-muted-foreground">Presenças</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className={`text-2xl font-bold ${resultado.percentual >= 75 ? "text-primary" : resultado.percentual >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                  {resultado.percentual}%
                </p>
                <p className="text-xs text-muted-foreground">Frequência</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Data</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Encontro</th>
                    <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Presença</th>
                    <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap hidden md:table-cell">Justificativa</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.presencas.map((p) => (
                    <tr key={p.encontroId} className="border-b border-border/20 hover:bg-muted/30">
                      <td className="py-3 px-3 whitespace-nowrap">{formatDate(p.encontroData)}</td>
                      <td className="py-3 px-3">{p.encontroTema}</td>
                      <td className="py-3 px-3 text-center">
                        {p.presente ? (
                          <CheckCircle2 className="h-4 w-4 text-primary inline" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500 inline" />
                        )}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">{p.justificativa || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function TurmaView({ turmas }: { turmas: { id: string; nome: string }[] }) {
  const [turmaId, setTurmaId] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    encontros: { id: string; data: string; tema: string }[]
    catequistas: CatequistaFreq[]
    stats: { totalCatequistas: number; totalEncontros: number; totalPresencas: number; mediaFrequencia: number }
  } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { getRelatorioPorTurma } = await import("@/actions/relatorios")
    const res = await getRelatorioPorTurma(turmaId || undefined, dataInicio || undefined, dataFim || undefined)
    setResultado(res)
    setLoading(false)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Frequência por Turma</CardTitle>
        <CardDescription>Veja o percentual de frequência de cada catequista.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="turma">Turma</Label>
              <Select value={turmaId} onValueChange={setTurmaId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Todas as turmas" />
                </SelectTrigger>
                <SelectContent>
                  {turmas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data fim</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Carregando..." : "Gerar Relatório"}
          </Button>
        </form>

        {resultado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{resultado.stats.totalCatequistas}</p>
                <p className="text-xs text-muted-foreground">Catequistas</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{resultado.stats.totalEncontros}</p>
                <p className="text-xs text-muted-foreground">Encontros</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold text-primary">{resultado.stats.totalPresencas}</p>
                <p className="text-xs text-muted-foreground">Presenças</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className={`text-2xl font-bold ${resultado.stats.mediaFrequencia >= 75 ? "text-primary" : resultado.stats.mediaFrequencia >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                  {resultado.stats.mediaFrequencia}%
                </p>
                <p className="text-xs text-muted-foreground">Média Frequência</p>
              </div>
            </div>

            {resultado.catequistas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum catequista encontrado para esta turma.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Catequista</th>
                      <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Presenças</th>
                      <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Frequência</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.catequistas.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/20 hover:bg-muted/30"
                      >
                        <td className="py-3 px-3 font-medium">{c.nome}</td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-primary font-medium">{c.presencas}</span>
                            <span className="text-muted-foreground">/</span>
                            <span>{c.totalEncontros}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3"><PercentBar value={c.percentual} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function BaixaView() {
  const [limite, setLimite] = useState(75)
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ catequistas: CatequistaFreq[] } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { getRelatorioBaixaFrequencia } = await import("@/actions/relatorios")
    const res = await getRelatorioBaixaFrequencia(limite, dataInicio || undefined, dataFim || undefined)
    setResultado(res)
    setLoading(false)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Catequistas com Baixa Frequência</CardTitle>
        <CardDescription>Catequistas com frequência abaixo do percentual definido.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limite">Limite mínimo (%)</Label>
              <Input id="limite" type="number" min={0} max={100} value={limite} onChange={(e) => setLimite(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Data início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data fim</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Carregando..." : "Filtrar"}
          </Button>
        </form>

        {resultado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold">{resultado.catequistas.length}</p>
                <p className="text-xs text-muted-foreground">Abaixo do limite</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <p className="text-2xl font-bold text-yellow-500">{limite}%</p>
                <p className="text-xs text-muted-foreground">Limite definido</p>
              </div>
            </div>

            {resultado.catequistas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum catequista com baixa frequência no período.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">{resultado.catequistas.length} catequistas abaixo de {limite}%</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Catequista</th>
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Presenças</th>
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Frequência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.catequistas.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/20 hover:bg-muted/30"
                        >
                          <td className="py-3 px-3 font-medium">{c.nome}</td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <span className="text-primary font-medium">{c.presencas}</span>
                              <span className="text-muted-foreground">/</span>
                              <span>{c.totalEncontros}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3"><PercentBar value={c.percentual} /></td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function EncontroView() {
  const [encontros, setEncontros] = useState<{ id: string; label: string; data: string; tema: string; turma: string }[]>([])
  const [encontroId, setEncontroId] = useState("")
  const [loadingEncontros, setLoadingEncontros] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    encontro: { id: string; tema: string; data: string; turma: string }
    lista: PresencaEncontroRow[]
    stats: { presentes: number; ausentes: number; pendentes: number; percentual: number; total: number }
  } | null>(null)

  async function carregarEncontros() {
    if (encontros.length > 0) return
    setLoadingEncontros(true)
    const { getEncontrosDisponiveis } = await import("@/actions/relatorios")
    const data = await getEncontrosDisponiveis()
    setEncontros(data)
    setLoadingEncontros(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!encontroId) return
    setLoading(true)
    const { getRelatorioEncontro } = await import("@/actions/relatorios")
    const res = await getRelatorioEncontro(encontroId)
    setResultado(res)
    setLoading(false)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base">Frequência por Encontro</CardTitle>
        <CardDescription>Selecione um encontro específico para ver a lista de presença detalhada.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="encontro-select">Encontro</Label>
            <Select
              value={encontroId}
              onValueChange={setEncontroId}
              onOpenChange={(open) => { if (open) carregarEncontros() }}
            >
              <SelectTrigger id="encontro-select" className="h-9">
                <SelectValue placeholder={loadingEncontros ? "Carregando encontros..." : "Selecione um encontro..."} />
              </SelectTrigger>
              <SelectContent>
                {loadingEncontros ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </div>
                ) : encontros.length === 0 ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">Nenhum encontro cadastrado.</div>
                ) : (
                  encontros.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading || !encontroId}>
            {loading ? "Carregando..." : "Ver Presença"}
          </Button>
        </form>

        {resultado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Cabeçalho do encontro */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/15 space-y-1">
              <p className="font-semibold text-sm">{resultado.encontro.tema}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(resultado.encontro.data)} · {resultado.encontro.turma}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xl font-bold">{resultado.stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xl font-bold text-primary">{resultado.stats.presentes}</p>
                <p className="text-xs text-muted-foreground">Presentes</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xl font-bold text-red-500">{resultado.stats.ausentes}</p>
                <p className="text-xs text-muted-foreground">Ausentes</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 text-center">
                <p className={`text-xl font-bold ${
                  resultado.stats.percentual >= 75 ? "text-primary" :
                  resultado.stats.percentual >= 50 ? "text-yellow-500" : "text-red-500"
                }`}>{resultado.stats.percentual}%</p>
                <p className="text-xs text-muted-foreground">Frequência</p>
              </div>
            </div>

            {/* Barra geral */}
            <PercentBar value={resultado.stats.percentual} />

            {/* Lista detalhada */}
            {resultado.lista.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum catequista ativo nesta turma.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Catequista</th>
                      <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                      <th className="text-left py-3 px-3 font-medium text-muted-foreground whitespace-nowrap hidden md:table-cell">Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.lista.map((c, i) => (
                      <motion.tr
                        key={c.catequistaId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/20 hover:bg-muted/30"
                      >
                        <td className="py-3 px-3 font-medium">{c.nome}</td>
                        <td className="py-3 px-3 text-center">
                          {c.presente === true ? (
                            <span className="inline-flex items-center gap-1 text-primary text-xs font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Presente
                            </span>
                          ) : c.presente === false ? (
                            <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                              <XCircle className="h-3.5 w-3.5" /> Ausente
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs font-medium">
                              <Clock className="h-3.5 w-3.5" /> Pendente
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                          {c.justificativa || "—"}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}

function IaView() {
  const [loading, setLoading] = useState(false)
  const [analise, setAnalise] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  async function handleAnalisar() {
    setLoading(true)
    setErro(null)
    setAnalise(null)
    setCopiado(false)

    try {
      const { analisarFaltasRecorrentes } = await import("@/actions/ai")
      const res = await analisarFaltasRecorrentes()
      if (res.error) {
        setErro(res.error)
      } else if (res.analise) {
        setAnalise(res.analise)
      } else {
        setErro("Não foi possível gerar a análise.")
      }
    } catch (err) {
      setErro("Erro de rede ao conectar com a IA.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopiar() {
    if (!analise) return
    try {
      await navigator.clipboard.writeText(analise)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar texto: ", err)
    }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500 fill-amber-500/20" />
          Análise de Faltas Recorrentes com IA
        </CardTitle>
        <CardDescription>
          A IA analisará a frequência de todos os catequistas ativos nos últimos 3 meses para mapear padrões de ausência e recomendar ações pastorais.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalisar} disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analisando histórico de presenças...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
              Analisar Faltas
            </>
          )}
        </Button>

        <AnimatePresence mode="wait">
          {erro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{erro}</span>
            </motion.div>
          )}

          {analise && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center bg-muted/10 p-3 rounded-lg border border-border/20">
                <span className="text-xs text-muted-foreground font-medium">
                  Análise gerada com sucesso
                </span>
                <Button variant="outline" size="sm" onClick={handleCopiar} className="gap-1.5 h-8 text-xs">
                  {copiado ? (
                    <>
                      <Check className="h-3 w-3 text-primary" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copiar Análise
                    </>
                  )}
                </Button>
              </div>

              <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground p-5 rounded-xl bg-muted/20 border border-border/30 select-text max-h-[500px] overflow-y-auto">
                {analise}
              </div>
            </motion.div>
          )}

          {!analise && !loading && !erro && (
            <div className="text-center py-8 px-4 border border-dashed border-border/50 rounded-xl bg-muted/5">
              <Sparkles className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Clique no botão acima para iniciar a análise inteligente dos últimos 3 meses.
              </p>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
