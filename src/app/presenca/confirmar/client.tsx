"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Church, CheckCircle2, XCircle, ExternalLink, Loader2, MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { confirmarPresenca, justificarAusencia } from "@/actions/presencas"

interface Props {
  catequistas: { id: string; nome: string }[]
  encontro: {
    id: string
    tema: string
    data: Date
    local: string | null
    linkPdf: string | null
    turma: { nome: string }
  } | null
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function PresencaPublicaClient({ catequistas, encontro }: Props) {
  const [catequistaId, setCatequistaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [respondido, setRespondido] = useState(false)
  const [erro, setErro] = useState("")
  const [modoJustificar, setModoJustificar] = useState(false)
  const [justificativa, setJustificativa] = useState("")
  const [ultimaResposta, setUltimaResposta] = useState<{ presente: boolean; justificativa?: string } | null>(null)

  async function handleConfirmar() {
    if (!encontro || !catequistaId) return
    setLoading(true)
    setErro("")
    const res = await confirmarPresenca(encontro.id, catequistaId)
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
    if (!encontro || !catequistaId || !justificativa.trim()) return
    setLoading(true)
    setErro("")
    const res = await justificarAusencia(encontro.id, catequistaId, justificativa)
    if (res.error) {
      setErro(res.error)
    } else {
      setRespondido(true)
      setUltimaResposta({ presente: false, justificativa })
      setModoJustificar(false)
    }
    setLoading(false)
  }

  if (!encontro) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
        <Card className="border-border/50 max-w-md w-full text-center">
          <CardContent className="p-8">
            <Church className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Nenhum Encontro Agendado</h1>
            <p className="text-muted-foreground text-sm">
              No momento não há encontros futuros programados. Volte mais tarde!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const catequistaSelecionado = catequistas.find((c) => c.id === catequistaId)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-4"
      >
        <div className="text-center mb-6">
          <Church className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Confirmação de Presença</h1>
          <p className="text-sm text-muted-foreground">Registre sua presença no próximo encontro</p>
        </div>

        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6 space-y-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary font-medium">
              {encontro.turma.nome}
            </div>
            <h2 className="text-xl font-bold">{encontro.tema}</h2>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📅 {formatDate(encontro.data)}</p>
              {encontro.local && <p>📍 {encontro.local}</p>}
            </div>
            {encontro.linkPdf && (
              <a
                href={encontro.linkPdf}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir Material (PDF)
              </a>
            )}
          </CardContent>
        </Card>

        {!respondido && (
          <Card className="border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="catequista">Seu nome</Label>
                <Select value={catequistaId} onValueChange={setCatequistaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nome" />
                  </SelectTrigger>
                  <SelectContent>
                    {catequistas.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {modoJustificar ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="justificativa">Motivo da ausência</Label>
                    <Input
                      id="justificativa"
                      value={justificativa}
                      onChange={(e) => setJustificativa(e.target.value)}
                      placeholder="Ex: Não poderei comparecer por motivo de saúde..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setModoJustificar(false)} disabled={loading}>
                      Voltar
                    </Button>
                    <Button className="flex-1" onClick={handleJustificar} disabled={loading || !justificativa.trim()}>
                      {loading ? "Salvando..." : "Registrar Ausência"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full text-base"
                    size="lg"
                    onClick={handleConfirmar}
                    disabled={loading || !catequistaId}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Confirmando...</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4" /> Confirmar Presença</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setModoJustificar(true)}
                    disabled={loading || !catequistaId}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Justificar Ausência
                  </Button>
                </div>
              )}

              {erro && <p className="text-sm text-destructive text-center">{erro}</p>}
            </CardContent>
          </Card>
        )}

        {respondido && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="border-primary/20 bg-card/80 backdrop-blur-sm text-center">
              <CardContent className="p-8 space-y-3">
                {ultimaResposta?.presente ? (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-primary">Presença Confirmada!</h2>
                    <p className="text-muted-foreground text-sm">
                      Sua presença no encontro <strong>{encontro.tema}</strong> foi registrada com sucesso.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mx-auto w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <XCircle className="h-8 w-8 text-yellow-500" />
                    </div>
                    <h2 className="text-xl font-bold text-yellow-500">Ausência Registrada</h2>
                    <p className="text-muted-foreground text-sm">
                      Sua ausência no encontro <strong>{encontro.tema}</strong> foi registrada.
                    </p>
                    {ultimaResposta?.justificativa && (
                      <p className="text-sm text-muted-foreground italic">&quot;{ultimaResposta.justificativa}&quot;</p>
                    )}
                  </>
                )}
                <p className="text-xs text-muted-foreground pt-2">🙏 Muito obrigado!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
