"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { 
  Users, 
  ClipboardCheck, 
  Church, 
  BarChart3, 
  ChevronRight, 
  CheckCircle2, 
  Bell, 
  Sparkles, 
  PlusCircle, 
  TrendingUp, 
  Bot, 
  FileText,
  CalendarDays
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const statIcons = {
  catequistas: Users,
  encontros: Church,
  presencasHoje: ClipboardCheck,
  frequenciaMedia: BarChart3,
} as const

const statConfig = {
  catequistas: { color: "from-blue-500 to-blue-600", label: "Catequistas Ativos" },
  encontros: { color: "from-purple-500 to-purple-600", label: "Encontros" },
  presencasHoje: { color: "from-emerald-500 to-teal-600", label: "Presenças Hoje" },
  frequenciaMedia: { color: "from-orange-500 to-amber-600", label: "Frequência Média" },
} as const

interface DashboardData {
  stats: { catequistas: number; encontros: number; presencasHoje: number; frequenciaMedia: number }
  historicoFrequencia: { data: string; percentual: number; tema: string }[]
  ultimasPresencas: { nome: string; tema: string; data: string }[]
  proximosEncontros: { id: string; tema: string; data: string; turma: string; confirmados: number }[]
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 800
    const step = Math.max(1, Math.floor(value / 30))
    const interval = setInterval(() => {
      start += step
      if (start >= value) {
        setDisplay(value)
        clearInterval(interval)
      } else {
        setDisplay(start)
      }
    }, duration / (value / step || 1))
    return () => clearInterval(interval)
  }, [inView, value])

  return <span ref={ref}>{display}{suffix}</span>
}

function PulseDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
    </span>
  )
}

function MiniGraficoFrequencia({ historico }: { historico: { data: string; percentual: number; tema: string }[] }) {
  if (!historico || historico.length === 0) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center text-center p-4 bg-muted/5 border border-dashed border-border/50 rounded-xl">
        <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-xs text-muted-foreground">Nenhum histórico disponível ainda.</p>
      </div>
    )
  }

  const width = 500
  const height = 220
  const paddingLeft = 40
  const paddingRight = 20
  const paddingTop = 30
  const paddingBottom = 40
  const plotWidth = width - paddingLeft - paddingRight
  const plotHeight = height - paddingTop - paddingBottom
  const n = historico.length

  const points = historico.map((pt, i) => {
    const x = paddingLeft + (i * (plotWidth / Math.max(1, n - 1)))
    const y = paddingTop + plotHeight - (pt.percentual / 100 * plotHeight)
    return { x, y, pt }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`
    : ""

  return (
    <div className="relative w-full overflow-hidden bg-muted/20 p-3 sm:p-5 rounded-xl border border-border/30">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = paddingTop + plotHeight - (val / 100 * plotHeight)
          return (
            <g key={val}>
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                className="stroke-border/40 stroke-1" 
                strokeDasharray="4 4"
              />
              <text 
                x={paddingLeft - 10} 
                y={y} 
                textAnchor="end" 
                alignmentBaseline="middle" 
                className="text-[9px] font-semibold fill-muted-foreground/75 font-sans"
              >
                {val}%
              </text>
            </g>
          )
        })}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="url(#areaGrad)" className="transition-all duration-300" />}

        {/* Trend Line */}
        {linePath && (
          <path 
            d={linePath} 
            fill="none" 
            stroke="url(#lineGrad)" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}

        {/* Connection circles and labels */}
        {points.map((p, i) => (
          <g key={i} className="group/node">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="12" 
              className="fill-transparent cursor-help"
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="6.5" 
              className="fill-background stroke-primary stroke-[3] shadow-md shadow-primary/20 transition-all duration-200 group-hover/node:r-[8px]"
            />
            <text 
              x={p.x} 
              y={p.y - 12} 
              textAnchor="middle" 
              className="text-[10px] font-bold fill-foreground font-sans drop-shadow-sm select-none"
            >
              {p.pt.percentual}%
            </text>
            <text 
              x={p.x} 
              y={paddingTop + plotHeight + 18} 
              textAnchor="middle" 
              className="text-[9px] font-semibold fill-muted-foreground font-sans"
            >
              {p.pt.data}
            </text>
            <title>{`${p.pt.tema} (${p.pt.percentual}% de presença)`}</title>
          </g>
        ))}
      </svg>
    </div>
  )
}

function FrequenciaCircularProgress({ value }: { value: number }) {
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg className="w-10 h-10 transform -rotate-95 select-none shrink-0">
      <circle
        cx="20"
        cy="20"
        r={radius}
        className="stroke-muted fill-transparent stroke-[3]"
      />
      <circle
        cx="20"
        cy="20"
        r={radius}
        className="stroke-amber-500 fill-transparent stroke-[3.5] transition-all duration-500"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const formattedDate = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 sm:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          Dashboard
        </h1>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Banner Pastoral de Boas-Vindas */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/15 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
              Paróquia em Ação
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Paz e Bem, Coordenador!
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
              Gerencie seus catequistas, registre presenças e gere relatórios com IA. Hoje é <span className="font-semibold text-foreground">{formattedDate}</span>.
            </p>
          </div>
        </motion.div>

        {/* Grid de Ações Rápidas - Super Amigável no Celular */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Atalhos e Ações Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/presenca">
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 p-4 group bg-card hover:bg-muted/10 h-full">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Fazer Chamada
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-[11px] text-muted-foreground">Registrar presença de hoje</p>
                </div>
              </Card>
            </Link>

            <Link href="/relatorios/narrativo">
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 p-4 group bg-card hover:bg-muted/10 h-full">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/15" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Relatório IA
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-[11px] text-muted-foreground">Gerar análise pastoral mensal</p>
                </div>
              </Card>
            </Link>

            <Link href="/encontros">
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 p-4 group bg-card hover:bg-muted/10 h-full">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Church className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Encontros
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-[11px] text-muted-foreground">Gerenciar roteiros e temas</p>
                </div>
              </Card>
            </Link>

            <Link href="/assistente">
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 p-4 group bg-card hover:bg-muted/10 h-full">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <Bot className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                    Assistente IA
                    <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </p>
                  <p className="text-[11px] text-muted-foreground">Perguntar sobre dados gerais</p>
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Layout Principal em Duas Colunas no Notebook, Única no Celular */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Coluna 1 & 2: Gráfico e Controles (Mais larga no Desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gráfico de Evolução da Presença */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Evolução de Presença
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Histórico percentual dos últimos 6 encontros realizados
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MiniGraficoFrequencia historico={data.historicoFrequencia} />
              </CardContent>
            </Card>

            {/* Grid dos Cards de Estatísticas (Passados para baixo do gráfico ou lado, organizados) */}
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(data.stats) as Array<keyof typeof data.stats>).map((key) => {
                const Icon = statIcons[key]
                const cfg = statConfig[key]
                const isFreqMedia = key === "frequenciaMedia"
                return (
                  <Card key={key} className="group border-border/50 bg-card/45 hover:border-primary/25 transition-all duration-300 cursor-default">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${cfg.color} shadow-lg shadow-${cfg.color.split(" ")[0].replace("from-", "")}/10 group-hover:scale-105 transition-transform duration-300`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-medium truncate max-w-[100px] sm:max-w-none">{cfg.label}</p>
                          <p className="text-lg sm:text-xl font-extrabold tabular-nums tracking-tight">
                            {isFreqMedia ? (
                              <AnimatedNumber value={data.stats[key]} suffix="%" />
                            ) : (
                              <AnimatedNumber value={data.stats[key]} />
                            )}
                          </p>
                        </div>
                      </div>
                      
                      {/* Efeito Visual Circular para Frequência Média */}
                      {isFreqMedia && (
                        <FrequenciaCircularProgress value={data.stats[key]} />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Coluna 3: Atividades Recentes e Próximos Eventos */}
          <div className="space-y-6">
            
            {/* Próximos Encontros */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Próximos Encontros
                  {data.proximosEncontros.length > 0 && <PulseDot />}
                </CardTitle>
                <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">{data.proximosEncontros.length}</span>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {data.proximosEncontros.length > 0 ? (
                  <div className="space-y-2">
                    {data.proximosEncontros.map((e, i) => (
                      <div
                        key={e.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-muted/20 border border-border/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Church className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold leading-tight text-foreground truncate">{e.tema}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(e.data).toLocaleDateString("pt-BR")} — {e.turma}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-bold text-primary bg-primary/5 border border-primary/10 px-2 py-0.5 rounded-full">
                            {e.confirmados}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Church className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Nenhum encontro agendado.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Últimas Presenças */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Atividade Recente
                </CardTitle>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-semibold px-2 py-0.5 rounded-full">Recente</span>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                {data.ultimasPresencas.length > 0 ? (
                  <div className="space-y-2">
                    {data.ultimasPresencas.map((p, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs p-2 rounded-xl bg-muted/15 hover:bg-muted/30 transition-colors"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">{p.nome}</p>
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">Confirmou presença em: <span className="font-medium text-foreground">{p.tema}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ClipboardCheck className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Nenhuma presença confirmada recentemente.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </>
  )
}
