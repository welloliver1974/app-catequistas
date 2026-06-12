"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { BarChart3, Users, AlertTriangle, Download, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { PresencaRow, CatequistaFreq } from "@/actions/relatorios"

type Tab = "individual" | "turma" | "baixa"

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
      <header className="h-16 border-b border-border/40 flex items-center px-6">
        <h1 className="text-lg font-semibold">Relatórios de Frequência</h1>
      </header>

      <div className="p-6">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("individual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "baixa"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            Baixa Frequência
          </button>
        </div>

        {tab === "individual" && <IndividualView catequistas={catequistas} />}
        {tab === "turma" && <TurmaView turmas={turmas} />}
        {tab === "baixa" && <BaixaView />}
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
              <select
                id="catequista"
                value={catequistaId}
                onChange={(e) => setCatequistaId(e.target.value)}
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Selecione...</option>
                {catequistas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
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

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Encontro</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Presença</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Justificativa</th>
                </tr>
              </thead>
              <tbody>
                {resultado.presencas.map((p) => (
                  <tr key={p.encontroId} className="border-b border-border/20 hover:bg-muted/30">
                    <td className="py-3 px-2">{formatDate(p.encontroData)}</td>
                    <td className="py-3 px-2">{p.encontroTema}</td>
                    <td className="py-3 px-2 text-center">
                      {p.presente ? (
                        <CheckCircle2 className="h-4 w-4 text-primary inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 inline" />
                      )}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{p.justificativa || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <select
                id="turma"
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todas as turmas</option>
                {turmas.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm text-muted-foreground mb-4">{resultado.encontros.length} encontros no período</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Catequista</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Turmas</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Presenças</th>
                  <th className="text-center py-3 px-2 font-medium text-muted-foreground">Frequência</th>
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
                    <td className="py-3 px-2 font-medium">{c.nome}</td>
                    <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{c.turmas}</td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">{c.presencas}/{c.totalEncontros}</td>
                    <td className="py-3 px-2"><PercentBar value={c.percentual} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
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
              <Label htmlFor="dataInicio">Data início</Label>
              <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data fim</Label>
              <Input id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Carregando..." : "Filtrar"}
          </Button>
        </form>

        {resultado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {resultado.catequistas.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum catequista com baixa frequência no período.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{resultado.catequistas.length} catequistas abaixo de {limite}%</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Catequista</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Turmas</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Presenças</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Frequência</th>
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
                        <td className="py-3 px-2 font-medium">{c.nome}</td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{c.turmas}</td>
                        <td className="py-3 px-2 text-center hidden sm:table-cell">{c.presencas}/{c.totalEncontros}</td>
                        <td className="py-3 px-2"><PercentBar value={c.percentual} /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  )
}
