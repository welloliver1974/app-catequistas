"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lightbulb, Sparkles, Copy, Check, Loader2, AlertCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { analisarTemasRecorrentes } from "@/actions/ai"

export function TemasRecorrentesClient() {
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
      const res = await analisarTemasRecorrentes()
      if (res.error) {
        setErro(res.error)
      } else if (res.analise) {
        setAnalise(res.analise)
      } else {
        setErro("Não foi possível analisar os temas.")
      }
    } catch {
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
    } catch {
      console.error("Erro ao copiar texto.")
    }
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 sm:px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Análise de Temas Recorrentes</h1>
        </div>
      </header>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400" />
              IA analisa os resumos dos encontros
            </CardTitle>
            <CardDescription>
              A IA analisará os resumos de todos os encontros para mapear temas recorrentes, ver a evolução
              ao longo do tempo e sugerir os próximos temas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleAnalisar}
              disabled={loading}
              className="gap-2 bg-primary hover:bg-primary/95 transition-all shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analisando temas...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
                  Analisar Temas com IA
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

          {analise && (
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
                      Análise Gerada
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Temas recorrentes identificados nos resumos dos encontros
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
                        Copiar Análise
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin select-text bg-muted/20 border border-border/30 p-5 rounded-xl">
                    {analise}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!analise && !loading && !erro && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 px-4 border border-dashed border-border/60 rounded-xl bg-muted/5"
            >
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10">
                <Lightbulb className="h-6 w-6 text-primary/60" />
              </div>
              <h3 className="text-sm font-semibold text-foreground/80 mb-1">
                Nenhuma análise gerada
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Clique em &quot;Analisar Temas com IA&quot; para mapear os temas recorrentes dos encontros
                e receber sugestões para os próximos.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
