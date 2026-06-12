"use client"

import { useEffect, useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Users, ClipboardCheck, Church, BarChart3, ChevronRight, CheckCircle2, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  presencasHoje: { color: "from-green-500 to-emerald-600", label: "Presenças" },
  frequenciaMedia: { color: "from-orange-500 to-amber-600", label: "Frequência Média" },
} as const

interface DashboardData {
  stats: { catequistas: number; encontros: number; presencasHoje: number; frequenciaMedia: number }
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
    }, duration / (value / step))
    return () => clearInterval(interval)
  }, [inView, value])

  return <span ref={ref}>{display}{suffix}</span>
}

function PulseDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
    </span>
  )
}

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </header>
      <div className="p-6 space-y-6">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {(Object.keys(data.stats) as Array<keyof typeof data.stats>).map((key) => {
            const Icon = statIcons[key]
            const cfg = statConfig[key]
            return (
              <motion.div
                key={key}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Card className="group border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 cursor-default">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${cfg.color} shadow-lg shadow-${cfg.color.split(" ")[0].replace("from-", "")}/20 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold tabular-nums">
                        {key === "frequenciaMedia" ? (
                          <AnimatedNumber value={data.stats[key]} suffix="%" />
                        ) : (
                          <AnimatedNumber value={data.stats[key]} />
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{cfg.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Últimas Presenças
                </CardTitle>
                <span className="text-xs text-muted-foreground">{data.ultimasPresencas.length} registros</span>
              </CardHeader>
              <CardContent className="pt-4">
                {data.ultimasPresencas.length > 0 ? (
                  <div className="space-y-1">
                    {data.ultimasPresencas.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span className="font-medium">{p.nome}</span>
                        <span className="text-muted-foreground mx-1">—</span>
                        <span className="text-muted-foreground truncate">{p.tema}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma presença registrada.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Próximos Encontros
                  {data.proximosEncontros.length > 0 && <PulseDot />}
                </CardTitle>
                <span className="text-xs text-muted-foreground">{data.proximosEncontros.length} agendados</span>
              </CardHeader>
              <CardContent className="pt-4">
                {data.proximosEncontros.length > 0 ? (
                  <div className="space-y-1">
                    {data.proximosEncontros.map((e, i) => (
                      <motion.div
                        key={e.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.08 }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Church className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">{e.tema}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(e.data).toLocaleDateString("pt-BR")} — {e.turma}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                            {e.confirmados}
                          </span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhum encontro futuro.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  )
}
