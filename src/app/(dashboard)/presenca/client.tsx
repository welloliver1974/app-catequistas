"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Church, CheckCircle2, XCircle, Clock, ExternalLink, MessageCircle, FileText, Sparkles, Loader2, Copy, QrCode, Download, CalendarDays } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type EstadoPresenca = "presente" | "ausente" | "pendente"

interface EncontroSeletor {
  id: string
  data: string
  tema: string
  numeroEncontro: number | null
}

interface Props {
  user: { name: string }
  encontro: {
    id: string
    tema: string
    data: string
    local: string
    linkPdf: string
    turma: string
    numeroEncontro: number | null
    selecionado: boolean
    dataPassada: boolean
  } | null
  encontroSelecionadoId: string
  encontros: EncontroSeletor[]
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

function formatDataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

function labelEncontro(e: EncontroSeletor) {
  return e.numeroEncontro
    ? `Encontro ${e.numeroEncontro} — ${formatDataCurta(e.data)}`
    : `${formatDataCurta(e.data)} — ${e.tema}`
}

const MARCAR_OPCOES = [
  { estado: "presente" as const, Icon: CheckCircle2, label: "Presente" },
  { estado: "ausente" as const, Icon: XCircle, label: "Ausente" },
  { estado: "pendente" as const, Icon: Clock, label: "Pendente" },
]

export function PresencaAdminClient({ user, encontro, encontroSelecionadoId, encontros, catequistas, stats }: Props) {
  const siteUrl = "https://catequistas.housecloud.tec.br"
  const router = useRouter()
  const [mensagemModal, setMensagemModal] = useState<{ nome: string; texto: string; telefone: string } | null>(null)
  const [qrModal, setQrModal] = useState(false)
  const [gerandoMsg, setGerandoMsg] = useState<string | null>(null) // catequistaId sendo gerado
  const [copiado, setCopiado] = useState(false)
  const [marcando, setMarcando] = useState<{ catequistaId: string; estado: EstadoPresenca } | null>(null)
  const [erroMarca, setErroMarca] = useState<string | null>(null)

  const tituloCard = encontro
    ? encontro.selecionado
      ? encontro.numeroEncontro
        ? `Encontro ${encontro.numeroEncontro}`
        : `Encontro — ${formatDataCurta(encontro.data)}`
      : encontro.dataPassada
        ? "Último Encontro"
        : "Próximo Encontro"
    : ""

  const mostrarBadgeSemFuturo = !!encontro && !encontro.selecionado && encontro.dataPassada
  const tituloWhatsApp = encontro && (encontro.selecionado || encontro.dataPassada)
    ? "Encontro de Catequese"
    : "Proximo Encontro de Catequese"

  const mensagemWhatsApp = encontro
    ? `*${tituloWhatsApp}*\nData: ${formatDataCurta(encontro.data)}\nLocal: ${encontro.local || encontro.turma}\nTema: ${encontro.tema}\n\nConfirme sua presenca:\n${siteUrl}/presenca/confirmar?encontro=${encontro.id}`
    : ""

  function handleSelecionarEncontro(value: string) {
    if (value === "auto") router.replace("/presenca", { scroll: false })
    else router.replace(`/presenca?encontro=${value}`, { scroll: false })
  }

  async function handleMarcar(catequistaId: string, estado: EstadoPresenca) {
    if (!encontro) return
    setMarcando({ catequistaId, estado })
    setErroMarca(null)
    try {
      const { marcarPresencaAdmin } = await import("@/actions/presencas")
      const res = await marcarPresencaAdmin(encontro.id, catequistaId, estado)
      if (res.error) setErroMarca(res.error)
    } finally {
      setMarcando(null)
    }
  }

  function abrirWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(mensagemWhatsApp)}`
    window.open(url, "_blank")
  }

  const qrUrl = encontro
    ? `${siteUrl}/api/qr?url=${encodeURIComponent(`${siteUrl}/presenca/confirmar?encontro=${encontro.id}`)}`
    : ""

  function baixarQR() {
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = `qrcode-encontro-${encontro?.id}.svg`
    link.click()
  }

  async function handleGerarMensagem(catequistaId: string, nome: string, telefone: string) {
    if (!encontro) return
    setGerandoMsg(catequistaId)
    const { gerarMensagemCatequista } = await import("@/actions/ai")
    const res = await gerarMensagemCatequista(catequistaId, encontro.id)
    if (res.mensagem) {
      setMensagemModal({ nome, texto: res.mensagem, telefone })
    }
    setGerandoMsg(null)
  }

  function copiarMensagem(texto: string) {
    navigator.clipboard.writeText(texto)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <>
      {/* Modal de mensagem personalizada */}
      {mensagemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">Mensagem para {mensagemModal.nome}</h3>
              <button onClick={() => setMensagemModal(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-sm whitespace-pre-wrap leading-relaxed">
              {mensagemModal.texto}
            </div>
            {!mensagemModal.telefone && (
              <p className="text-xs text-muted-foreground text-center">
                Catequista sem telefone cadastrado. A mensagem vai abrir sem destinatário.
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2" onClick={() => copiarMensagem(mensagemModal.texto)}>
                <Copy className="h-4 w-4" />
                {copiado ? "Copiado!" : "Copiar"}
              </Button>
              <Button size="sm" className="gap-2" onClick={() => {
                const num = mensagemModal.telefone?.replace(/\D/g, "")
                const url = num
                  ? `https://wa.me/55${num}?text=${encodeURIComponent(mensagemModal.texto)}`
                  : `https://wa.me/?text=${encodeURIComponent(mensagemModal.texto)}`
                window.open(url, "_blank")
              }}>
                <MessageCircle className="h-4 w-4" />
                Enviar no WhatsApp
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal QR Code */}
      {qrModal && encontro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-xl shadow-2xl w-full max-w-xs mx-4 p-6 space-y-4 text-center"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">QR do Encontro</h3>
              <button onClick={() => setQrModal(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">&times;</button>
            </div>
            <div className="bg-white rounded-xl p-4 mx-auto w-fit">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            <p className="text-xs text-muted-foreground">
              Escaneie para abrir a confirmação de presença
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={baixarQR}>
                <Download className="h-4 w-4" />
                Baixar SVG
              </Button>
              <Button size="sm" className="flex-1 gap-2" onClick={() => window.open(`${siteUrl}/presenca/confirmar?encontro=${encontro.id}`, "_blank")}>
                <ExternalLink className="h-4 w-4" />
                Abrir Link
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Painel Admin</h1>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Seletor de encontro */}
        {encontros.length > 0 && (
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Encontro
              </Label>
              <Select value={encontroSelecionadoId} onValueChange={handleSelecionarEncontro}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione um encontro..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Próximo encontro (automático)</SelectItem>
                  {encontros.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{labelEncontro(e)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {encontro ? (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Church className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-primary uppercase tracking-wide">
                          {tituloCard}
                        </span>
                        {mostrarBadgeSemFuturo && (
                          <span className="text-xs bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                            Sem encontro futuro agendado
                          </span>
                        )}
                        {encontro.selecionado && encontro.dataPassada && (
                          <span className="text-xs bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">
                            Encontro passado
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold">{encontro.tema}</h2>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span>{formatDate(encontro.data)}</span>
                        <span>{encontro.local || encontro.turma}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {encontro.linkPdf && (
                          <a
                            href={encontro.linkPdf}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4" />
                            Material (PDF)
                          </a>
                        )}
                        <a
                          href={`${siteUrl}/presenca/confirmar?encontro=${encontro.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Link público de presença
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button onClick={abrirWhatsApp} className="flex-1 md:flex-initial gap-2 h-10 text-sm md:h-11 md:text-base" size="lg">
                        <MessageCircle className="h-5 w-5" />
                        Compartilhar
                      </Button>
                      <Button variant="outline" onClick={() => setQrModal(true)} className="gap-2 h-10 text-sm md:h-11 md:text-base" size="lg">
                        <QrCode className="h-5 w-5" />
                      </Button>
                    </div>
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
                        className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 sm:px-6 py-3 text-sm hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-medium truncate">{c.nome}</span>
                          {c.justificativa && (
                            <span className="text-xs text-muted-foreground italic max-w-[120px] xs:max-w-xs truncate">
                              &quot;{c.justificativa}&quot;
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {MARCAR_OPCOES.map(({ estado, Icon, label }) => {
                            const ativo =
                              (estado === "presente" && c.presente === true) ||
                              (estado === "ausente" && c.presente === false) ||
                              (estado === "pendente" && c.presente === null)
                            const processando = marcando?.catequistaId === c.id && marcando.estado === estado
                            return (
                              <Button
                                key={estado}
                                size="sm"
                                variant={ativo ? "default" : "outline"}
                                disabled={marcando !== null}
                                onClick={() => handleMarcar(c.id, estado)}
                                className="gap-1 h-7 px-2 text-xs"
                              >
                                {processando ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
                                {label}
                              </Button>
                            )
                          })}
                          {(c.presente === false || c.presente === null) && encontro && (
                            <button
                              title="Gerar mensagem IA"
                              onClick={() => handleGerarMensagem(c.id, c.nome, c.telefone)}
                              disabled={gerandoMsg === c.id}
                              className="p-1 rounded hover:bg-primary/10 transition-colors text-primary"
                            >
                              {gerandoMsg === c.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <Sparkles className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {erroMarca && (
                  <p className="text-sm text-destructive px-4 sm:px-6 py-2">{erroMarca}</p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center text-muted-foreground space-y-2">
              <Church className="h-12 w-12 mx-auto opacity-30" />
              <p className="text-base font-medium">Nenhum encontro cadastrado</p>
              <p className="text-sm">Crie um encontro para começar a registrar presenças.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
