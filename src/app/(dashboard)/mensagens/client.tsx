"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bell, Heart, Megaphone, MessageSquare, Sparkles, Copy, CheckCheck,
  ExternalLink, Loader2, Church, ChevronRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { gerarMensagemGrupo, listarEncontrosPassados, listarEncontrosLembrete } from "@/actions/ai"

type TipoMsg = "lembrete" | "agradecimento" | "convocacao" | "livre"

interface TipoConfig {
  tipo: TipoMsg
  label: string
  descricao: string
  icon: typeof Bell
  cor: string
}

const TIPOS: TipoConfig[] = [
  { tipo: "lembrete", label: "Lembrete", descricao: "Aviso pastoral do encontro com data, tema e local", icon: Bell, cor: "text-sky-500" },
  { tipo: "agradecimento", label: "Agradecimento", descricao: "Pós-encontro com gratidão, presença e próximo encontro", icon: Heart, cor: "text-rose-500" },
  { tipo: "convocacao", label: "Comunicado", descricao: "Aviso especial, mudança ou orientação importante", icon: Megaphone, cor: "text-amber-500" },
  { tipo: "livre", label: "Mensagem Livre", descricao: "Você escreve e a IA aprimora o tom pastoral", icon: MessageSquare, cor: "text-emerald-500" },
]

export function MensagensClient() {
  const [tipo, setTipo] = useState<TipoMsg>("lembrete")
  const [encontrosLembrete, setEncontrosLembrete] = useState<{ id: string; label: string }[]>([])
  const [encontroLembreteId, setEncontroLembreteId] = useState("")
  const [encontrosPassados, setEncontrosPassados] = useState<{ id: string; label: string }[]>([])
  const [encontroId, setEncontroId] = useState("")
  const [instrucao, setInstrucao] = useState("")
  const [mensagemUsuario, setMensagemUsuario] = useState("")
  const [mensagemGerada, setMensagemGerada] = useState("")
  const [encontroNome, setEncontroNome] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Carrega encontros para lembrete ao montar ou ao selecionar tipo lembrete
  useEffect(() => {
    if (tipo === "lembrete" && encontrosLembrete.length === 0) {
      listarEncontrosLembrete().then((lista) => {
        setEncontrosLembrete(lista)
        if (lista.length > 0) setEncontroLembreteId(lista[0].id)
      })
    }
  }, [tipo, encontrosLembrete.length])

  // Carrega encontros passados quando seleciona agradecimento
  useEffect(() => {
    if (tipo === "agradecimento" && encontrosPassados.length === 0) {
      listarEncontrosPassados().then((lista) => {
        setEncontrosPassados(lista)
        if (lista.length > 0) setEncontroId(lista[0].id)
      })
    }
  }, [tipo, encontrosPassados.length])

  async function handleGerar() {
    setLoading(true)
    setError(null)
    setShowResult(false)
    setMensagemGerada("")

    const res = await gerarMensagemGrupo({
      tipo,
      encontroId:
        tipo === "lembrete"
          ? encontroLembreteId || undefined
          : tipo === "agradecimento"
          ? encontroId || undefined
          : undefined,
      instrucao: tipo === "convocacao" ? instrucao : undefined,
      mensagemUsuario: tipo === "livre" ? mensagemUsuario : undefined,
    })

    if (res.error) {
      setError(res.error)
    } else {
      setMensagemGerada(res.mensagem || "")
      setEncontroNome((res as any).encontro || "")
      setShowResult(true)
    }
    setLoading(false)
  }

  function handleCopiar() {
    navigator.clipboard.writeText(mensagemGerada)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2500)
  }

  function handleAbrirWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(mensagemGerada)}`
    window.open(url, "_blank")
  }

  const podeGerar =
    (tipo === "lembrete" && (encontrosLembrete.length === 0 || encontroLembreteId)) ||
    (tipo === "agradecimento" && encontroId) ||
    (tipo === "convocacao" && instrucao.trim()) ||
    (tipo === "livre" && mensagemUsuario.trim())

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Mensagens para o Grupo</h1>
      </header>

      <div className="p-4 sm:p-6 max-w-3xl space-y-6">
        {/* Subtítulo */}
        <p className="text-sm text-muted-foreground">
          Gere mensagens acolhedoras, naturais e formatadas para WhatsApp com IA para compartilhar com os catequistas.
        </p>

        {/* Cards de seleção de tipo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TIPOS.map((t) => {
            const Icon = t.icon
            const ativo = tipo === t.tipo
            return (
              <button
                key={t.tipo}
                onClick={() => { setTipo(t.tipo); setShowResult(false); setMensagemGerada(""); setError(null) }}
                className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${
                  ativo
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 bg-card hover:border-border hover:bg-muted/30"
                }`}
              >
                <Icon className={`h-6 w-6 mb-2 ${ativo ? t.cor : "text-muted-foreground"}`} />
                <p className={`text-sm font-medium mb-0.5 ${ativo ? "text-foreground" : "text-muted-foreground"}`}>
                  {t.label}
                </p>
                <p className="text-[11px] text-muted-foreground leading-tight">{t.descricao}</p>
                {ativo && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Formulário dinâmico */}
        <Card className="border-border/50">
          <CardContent className="p-5 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={tipo}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {tipo === "lembrete" && (
                  <div className="space-y-3">
                    <Label htmlFor="encontroLembrete">Escolha o encontro para o lembrete</Label>
                    {encontrosLembrete.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum encontro agendado encontrado.</p>
                    ) : (
                      <select
                        id="encontroLembrete"
                        value={encontroLembreteId}
                        onChange={(e) => setEncontroLembreteId(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {encontrosLembrete.map((e) => (
                          <option key={e.id} value={e.id}>{e.label}</option>
                        ))}
                      </select>
                    )}
                    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-primary/5 border border-primary/10">
                      <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A IA vai redigir uma mensagem acolhedora e fraterna destacando a <strong>data exata</strong>, o <strong>tema</strong> e o <strong>local</strong> para animar os catequistas (sem link de presença).
                      </p>
                    </div>
                  </div>
                )}

                {tipo === "agradecimento" && (
                  <div className="space-y-3">
                    <Label htmlFor="encontro">Escolha o encontro realizado</Label>
                    {encontrosPassados.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum encontro encontrado.</p>
                    ) : (
                      <select
                        id="encontro"
                        value={encontroId}
                        onChange={(e) => setEncontroId(e.target.value)}
                        className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {encontrosPassados.map((e) => (
                          <option key={e.id} value={e.id}>{e.label}</option>
                        ))}
                      </select>
                    )}
                    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-rose-500/5 border border-rose-500/10">
                      <Heart className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        A mensagem incluirá o <strong>link de confirmação de presença</strong> para quem faltou ou precisa registrar e adiantará a <strong>data precisa do próximo encontro agendado</strong>.
                      </p>
                    </div>
                  </div>
                )}


                {tipo === "convocacao" && (
                  <div className="space-y-3">
                    <Label htmlFor="instrucao">O que você precisa comunicar?</Label>
                    <textarea
                      id="instrucao"
                      value={instrucao}
                      onChange={(e) => setInstrucao(e.target.value)}
                      placeholder="Ex: O encontro dessa semana vai ser no salão paroquial em vez da sala habitual..."
                      rows={4}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">A IA vai transformar sua instrução em uma mensagem clara e acolhedora.</p>
                  </div>
                )}

                {tipo === "livre" && (
                  <div className="space-y-3">
                    <Label htmlFor="mensagemLivre">Escreva sua mensagem</Label>
                    <textarea
                      id="mensagemLivre"
                      value={mensagemUsuario}
                      onChange={(e) => setMensagemUsuario(e.target.value)}
                      placeholder="Digite a mensagem que você quer enviar... A IA vai melhorar o texto mantendo o sentido original."
                      rows={4}
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    />
                    <p className="text-xs text-muted-foreground">A IA vai corrigir e melhorar o tom da sua mensagem, mantendo o conteúdo.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <Button
              onClick={handleGerar}
              disabled={loading || !podeGerar}
              className="w-full gap-2 h-11 text-sm"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Gerando mensagem...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Gerar Mensagem com IA</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultado */}
        <AnimatePresence>
          {showResult && mensagemGerada && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.03] to-background">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Church className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        Mensagem gerada
                        {encontroNome && <> — <span className="font-normal">{encontroNome}</span></>}
                      </span>
                    </div>
                    <CheckCheck className="h-4 w-4 text-primary/60" />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/40 border border-border/30 text-sm leading-relaxed whitespace-pre-wrap">
                    {mensagemGerada}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={handleCopiar} variant="default" className="flex-1 gap-2 h-11">
                      {copiado ? <CheckCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiado ? "Copiado!" : "Copiar Mensagem"}
                    </Button>
                    <Button onClick={handleAbrirWhatsApp} variant="outline" className="flex-1 gap-2 h-11">
                      <ExternalLink className="h-4 w-4" />
                      Abrir no WhatsApp
                    </Button>
                  </div>
                  {copiado && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-center text-primary font-medium"
                    >
                      ✅ Mensagem copiada! Agora é só colar no grupo do WhatsApp.
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Erro */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-sm text-red-600"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
