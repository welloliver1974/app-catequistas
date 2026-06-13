"use client"

import { motion } from "framer-motion"
import { Church, CheckCircle2, XCircle, Clock, ExternalLink, MessageCircle, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Props {
  user: { name: string }
  proximoEncontro: {
    id: string
    tema: string
    data: string
    local: string
    linkPdf: string
    turma: string
  } | null
  catequistas: {
    id: string
    nome: string
    telefone: string
    presente: boolean | null
    justificativa: string | null
  }[]
  stats: { total: number; confirmados: number; ausentes: number; pendentes: number }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function PresencaAdminClient({ user, proximoEncontro, catequistas, stats }: Props) {
  const siteUrl = "https://catequistas.housecloud.tec.br"

  const mensagemWhatsApp = proximoEncontro
    ? `📅 *Próximo Encontro de Catequese*\n\n*Tema:* ${proximoEncontro.tema}\n*Data:* ${formatDate(proximoEncontro.data)}\n*Local:* ${proximoEncontro.local || proximoEncontro.turma}\n\n✅ Confirme sua presença aqui:\n${siteUrl}/presenca/confirmar`
    : ""

  function abrirWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(mensagemWhatsApp)}`
    window.open(url, "_blank")
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Painel Admin</h1>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {proximoEncontro ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Church className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-primary uppercase tracking-wide">Próximo Encontro</span>
                      </div>
                      <h2 className="text-2xl font-bold">{proximoEncontro.tema}</h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span>{formatDate(proximoEncontro.data)}</span>
                        <span>{proximoEncontro.local || proximoEncontro.turma}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proximoEncontro.linkPdf && (
                          <a
                            href={proximoEncontro.linkPdf}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            Material (PDF)
                          </a>
                        )}
                        <a
                          href={`${siteUrl}/presenca/confirmar`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Link público de presença
                        </a>
                      </div>
                    </div>
                    <Button onClick={abrirWhatsApp} className="w-full md:w-auto md:shrink-0 gap-2 h-10 text-sm md:h-11 md:text-base" size="lg">
                      <MessageCircle className="h-5 w-5" />
                      Compartilhar no WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Catequistas", value: stats.total, color: "text-foreground" },
                { label: "Confirmados", value: stats.confirmados, color: "text-primary" },
                { label: "Ausentes", value: stats.ausentes, color: "text-yellow-500" },
                { label: "Pendentes", value: stats.pendentes, color: "text-muted-foreground" },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg bg-muted/30 text-center"
                >
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <Card className="border-border/50">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base">Respostas dos Catequistas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {catequistas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum catequista ativo cadastrado.
                  </p>
                ) : (
                  <div className="divide-y divide-border/20">
                    {catequistas.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex items-center justify-between px-4 sm:px-6 py-3 text-sm hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{c.nome}</span>
                          {c.justificativa && (
                            <span className="text-xs text-muted-foreground italic max-w-[120px] xs:max-w-xs truncate">
                              &quot;{c.justificativa}&quot;
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {c.presente === true ? (
                            <span className="flex items-center gap-1 text-primary text-xs font-medium">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Presente
                            </span>
                          ) : c.presente === false ? (
                            <span className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                              <XCircle className="h-3.5 w-3.5" /> Ausente
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-muted-foreground text-xs font-medium">
                              <Clock className="h-3.5 w-3.5" /> Pendente
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center text-muted-foreground space-y-2">
              <Church className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-base font-medium">Nenhum encontro futuro agendado</p>
              <p className="text-sm">Crie um encontro para começar a registrar presenças.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
