"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Church, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EncontroData {
  id: string
  data: string
  tema: string
  local: string
  turma: string
  confirmados: number
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]

export function CalendarioClient({ encontros }: { encontros: EncontroData[] }) {
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth())

  const encontrosPorDia = useMemo(() => {
    const map = new Map<string, EncontroData[]>()
    for (const e of encontros) {
      const key = new Date(e.data).toDateString()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(e)
    }
    return map
  }, [encontros])

  const dias = useMemo(() => {
    const primeiro = new Date(ano, mes, 1)
    const ultimo = new Date(ano, mes + 1, 0)
    const inicioSemana = primeiro.getDay()
    const diasNoMes = ultimo.getDate()

    const cells: (number | null)[] = []
    for (let i = 0; i < inicioSemana; i++) cells.push(null)
    for (let d = 1; d <= diasNoMes; d++) cells.push(d)
    return cells
  }, [ano, mes])

  function temEncontro(dia: number) {
    const date = new Date(ano, mes, dia).toDateString()
    return encontrosPorDia.get(date) ?? []
  }

  function mudarMes(delta: number) {
    let novoMes = mes + delta
    let novoAno = ano
    if (novoMes > 11) { novoMes = 0; novoAno++ }
    if (novoMes < 0) { novoMes = 11; novoAno-- }
    setMes(novoMes)
    setAno(novoAno)
  }

  const hojeStr = hoje.toDateString()

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-6">
        <h1 className="text-lg font-semibold">Calendário</h1>
      </header>

      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => mudarMes(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{MONTHS[mes]} {ano}</h2>
          <Button variant="outline" size="sm" onClick={() => mudarMes(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
              {dias.map((dia, i) => {
                if (dia === null) return <div key={`e${i}`} />
                const encontrosDoDia = temEncontro(dia)
                const isHoje = new Date(ano, mes, dia).toDateString() === hojeStr
                return (
                  <motion.div
                    key={dia}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`min-h-20 p-1 rounded-lg border text-sm transition-colors ${
                      isHoje
                        ? "border-primary bg-primary/5"
                        : encontrosDoDia.length > 0
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/30"
                    }`}
                  >
                    <span className={`text-xs font-medium ${isHoje ? "text-primary" : ""}`}>{dia}</span>
                    {encontrosDoDia.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {encontrosDoDia.slice(0, 2).map((e) => (
                          <div key={e.id} className="text-[10px] leading-tight text-primary truncate">
                            {e.tema}
                          </div>
                        ))}
                        {encontrosDoDia.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">+{encontrosDoDia.length - 2}</div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {encontros.length > 0 && (
          <Card className="border-border/50 mt-6">
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-3">Todos os Encontros</h3>
              <div className="space-y-2">
                {encontros.map((e) => (
                  <div key={e.id} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Church className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="font-medium">{e.tema}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.data).toLocaleDateString("pt-BR")} — {e.turma}
                          {e.local && ` — ${e.local}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {e.confirmados}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
