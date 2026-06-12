"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Church, CheckCircle2, XCircle, ExternalLink, Loader2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { confirmarPresenca, justificarAusencia } from "@/actions/presencas"

interface Props {
  catequista: { id: string; nome: string }
  proximoEncontro: {
    id: string
    tema: string
    data: string
    local: string
    linkPdf: string
    turma: string
  } | null
  jaConfirmado: boolean
  presencaAtual: { presente: boolean; justificativa: string | null } | null
  historico: { tema: string; data: string; presente: boolean; justificativa: string | null }[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function PresencaClient({ catequista, proximoEncontro, jaConfirmado, presencaAtual, historico }: Props) {
  const [loading, setLoading] = useState(false)
  const [respondido, setRespondido] = useState(jaConfirmado)
  const [erro, setErro] = useState("")
  const [modoJustificar, setModoJustificar] = useState(false)
  const [justificativa, setJustificativa] = useState("")
  const [ultimaResposta, setUltimaResposta] = useState<{ presente: boolean; justificativa?: string } | null>(
    presencaAtual ? { presente: presencaAtual.presente, justificativa: presencaAtual.justificativa ?? undefined } : null
  )

  async function handleConfirmar() {
    if (!proximoEncontro) return
    setLoading(true)
    setErro("")
    const res = await confirmarPresenca(proximoEncontro.id, catequista.id)
    if (res.error) {
      setErro(res.error)
    } else {
      setRespondido(true)
      setUltimaResposta({ presente: true })
      setModoJustificar(false)
    }
    setLoading(false)
  }

  async function handleJustificar() {
    if (!proximoEncontro || !justificativa.trim()) return
    setLoading(true)
    setErro("")
    const res = await justificarAusencia(proximoEncontro.id, catequista.id, justificativa)
    if (res.error) {
      setErro(res.error)
    } else {
      setRespondido(true)
      setUltimaResposta({ presente: false, justificativa })
      setModoJustificar(false)
    }
    setLoading(false)
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-6">
        <h1 className="text-lg font-semibold">Minha Presença</h1>
      </header>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        {proximoEncontro ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-border/50 text-center">
              <CardContent className="p-8 space-y-4">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Church className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Próximo Encontro</p>
                  <h2 className="text-2xl font-bold mt-1">{proximoEncontro.tema}</h2>
                </div>
                <div className="flex justify-center gap-6 text-sm text-muted-foreground">
                  <span>{formatDate(proximoEncontro.data)}</span>
                  <span>{proximoEncontro.local || proximoEncontro.turma}</span>
                </div>
                {proximoEncontro.linkPdf && (
                  <a
                    href={proximoEncontro.linkPdf}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir Material (PDF)
                  </a>
                )}
                <div className="pt-4">
                  {respondido ? (
                    <div>
                      <div className="inline-flex items-center gap-2 font-medium text-lg">
                        {ultimaResposta?.presente ? (
                          <><CheckCircle2 className="h-6 w-6 text-green-500" /> Presença Confirmada</>
                        ) : (
                          <><XCircle className="h-6 w-6 text-yellow-500" /> Ausência Registrada</>
                        )}
                      </div>
                      {ultimaResposta?.justificativa && (
                        <p className="text-sm text-muted-foreground mt-2 italic">
                          &quot;{ultimaResposta.justificativa}&quot;
                        </p>
                      )}
                    </div>
                  ) : modoJustificar ? (
                    <div className="space-y-3">
                      <div className="space-y-2 text-left">
                        <Label htmlFor="justificativa">Motivo da ausência</Label>
                        <Input
                          id="justificativa"
                          value={justificativa}
                          onChange={(e) => setJustificativa(e.target.value)}
                          placeholder="Ex: Não poderei comparecer por motivo de saúde..."
                        />
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" onClick={() => setModoJustificar(false)} disabled={loading}>
                          Voltar
                        </Button>
                        <Button onClick={handleJustificar} disabled={loading || !justificativa.trim()}>
                          {loading ? "Salvando..." : "Registrar Ausência"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 justify-center">
                      <Button size="lg" className="text-base px-8" onClick={handleConfirmar} disabled={loading}>
                        {loading ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4" /> Confirmar Presença</>
                        )}
                      </Button>
                      <Button size="lg" variant="outline" className="text-base px-8" onClick={() => setModoJustificar(true)} disabled={loading}>
                        <MessageSquare className="h-4 w-4" />
                        Justificar Ausência
                      </Button>
                    </div>
                  )}
                  {erro && <p className="text-sm text-destructive mt-2">{erro}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-8 text-center text-muted-foreground">
              Nenhum encontro futuro agendado.
            </CardContent>
          </Card>
        )}

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Meu Histórico</CardTitle>
          </CardHeader>
          <CardContent>
            {historico.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum registro de presença ainda.
              </p>
            ) : (
              <div className="space-y-2">
                {historico.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-border/20 last:border-0">
                    <div>
                      <p className="font-medium">{h.tema}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(h.data)}</p>
                      {h.justificativa && (
                        <p className="text-xs text-muted-foreground mt-1 italic">&quot;{h.justificativa}&quot;</p>
                      )}
                    </div>
                    {h.presente ? (
                      <span className="flex items-center gap-1 text-green-500 text-xs">
                        <CheckCircle2 className="h-3 w-3" /> Presente
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-500 text-xs">
                        <XCircle className="h-3 w-3" /> Ausente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
