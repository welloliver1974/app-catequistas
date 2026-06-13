"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Sparkles, Copy, Check, Calendar, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { gerarRelatorioNarrativo } from "@/actions/ai"

interface Props {
  turmas: { id: string; nome: string }[]
}

const MESES = [
  { value: "1", label: "Janeiro" },
  { value: "2", label: "Fevereiro" },
  { value: "3", label: "Março" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Maio" },
  { value: "6", label: "Junho" },
  { value: "7", label: "Julho" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Setembro" },
  { value: "10", label: "Outubro" },
  { value: "11", label: "Novembro" },
  { value: "12", label: "Dezembro" },
]

export function RelatorioNarrativoClient({ turmas }: Props) {
  const dataAtual = new Date()
  const [mes, setMes] = useState(String(dataAtual.getMonth() + 1))
  const [ano, setAno] = useState(String(dataAtual.getFullYear()))
  const [loading, setLoading] = useState(false)
  const [relatorio, setRelatorio] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)

  const anosDisponiveis = [
    String(dataAtual.getFullYear() - 2),
    String(dataAtual.getFullYear() - 1),
    String(dataAtual.getFullYear()),
    String(dataAtual.getFullYear() + 1),
  ]

  async function handleGerar() {
    setLoading(true)
    setErro(null)
    setRelatorio(null)
    setCopiado(false)

    try {
      const res = await gerarRelatorioNarrativo(Number(mes), Number(ano))
      if (res.error) {
        setErro(res.error)
      } else if (res.relatorio) {
        setRelatorio(res.relatorio)
      } else {
        setErro("Não foi possível gerar o relatório.")
      }
    } catch (err) {
      setErro("Erro de rede ao conectar com a IA.")
    } finally {
      setLoading(false)
    }
  }

  async function handleCopiar() {
    if (!relatorio) return
    try {
      await navigator.clipboard.writeText(relatorio)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar texto: ", err)
    }
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 sm:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Relatório Narrativo IA</h1>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Período do Relatório
            </CardTitle>
            <CardDescription>
              Selecione o mês e ano para coletar os encontros e gerar a análise narrativa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="mes">Mês</Label>
                <Select value={mes} onValueChange={setMes}>
                  <SelectTrigger id="mes" className="h-10">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {MESES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Select value={ano} onValueChange={setAno}>
                  <SelectTrigger id="ano" className="h-10">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {anosDisponiveis.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGerar}
              disabled={loading}
              className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Coletando dados e analisando...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
                  Gerar Relatório com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <AnimatePresence mode="wait">
          {erro && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-red-500/20 bg-red-500/5 text-red-500">
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">{erro}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {relatorio && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/50 shadow-md overflow-hidden bg-gradient-to-b from-card to-card/90">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/30 bg-muted/10 px-6 py-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Relatório Gerado
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {MESES.find((m) => m.value === mes)?.label} de {ano}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopiar}
                    className="gap-1.5 h-8 text-xs transition-all border-border/60 hover:bg-muted"
                  >
                    {copiado ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-primary" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copiar Relatório
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin select-text bg-muted/20 border border-border/30 p-5 rounded-xl">
                    {relatorio}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!relatorio && !loading && !erro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4 border border-dashed border-border/60 rounded-xl bg-muted/5"
            >
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10">
                <Sparkles className="h-6 w-6 text-primary/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground/80 mb-1">
                Nenhum relatório gerado
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Escolha o período acima e clique em "Gerar Relatório com IA" para obter um documento narrativo completo sobre as presenças do mês.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
