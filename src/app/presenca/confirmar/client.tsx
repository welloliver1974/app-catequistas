"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Church, CheckCircle2, XCircle, ExternalLink, Loader2, MessageSquare, User, Search, Check, RotateCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
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
  viaParametro?: boolean
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function getLetraInicial(nome: string): string {
  const primeiroChar = nome.trim().charAt(0).toUpperCase()
  return primeiroChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function PresencaPublicaClient({ catequistas, encontro, viaParametro = false }: Props) {
  const [catequistaId, setCatequistaId] = useState("")
  const [loading, setLoading] = useState(false)
  const [respondido, setRespondido] = useState(false)
  const [erro, setErro] = useState("")
  const [modoJustificar, setModoJustificar] = useState(false)
  const [justificativa, setJustificativa] = useState("")
  const [ultimaResposta, setUltimaResposta] = useState<{ presente: boolean; justificativa?: string } | null>(null)

  // Estados do seletor facilitado
  const [letraAtiva, setLetraAtiva] = useState<string>("")
  const [termoBusca, setTermoBusca] = useState<string>("")
  const [lembrado, setLembrado] = useState(false)
  const [trocandoNome, setTrocandoNome] = useState(false)

  // Recupera catequista memorizado no navegador do celular/aparelho
  useEffect(() => {
    try {
      const savedId = localStorage.getItem("catequista_presenca_id")
      if (savedId) {
        const existe = catequistas.some((c) => c.id === savedId)
        if (existe) {
          setCatequistaId(savedId)
          setLembrado(true)
        }
      }
    } catch {
      // Ignora erro em ambientes restritos de armazenamento
    }
  }, [catequistas])

  // Lista de letras iniciais disponíveis entre os catequistas
  const letrasDisponiveis = useMemo(() => {
    const letras = new Set<string>()
    catequistas.forEach((c) => {
      const letra = getLetraInicial(c.nome)
      if (letra && /[A-Z]/.test(letra)) letras.add(letra)
    })
    return Array.from(letras).sort()
  }, [catequistas])

  // Filtro de catequistas por letra inicial e busca textual opcional
  const catequistasFiltrados = useMemo(() => {
    return catequistas.filter((c) => {
      if (letraAtiva && getLetraInicial(c.nome) !== letraAtiva) {
        return false
      }
      if (termoBusca.trim()) {
        const buscaNorm = termoBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const nomeNorm = c.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (!nomeNorm.includes(buscaNorm)) return false
      }
      return true
    })
  }, [catequistas, letraAtiva, termoBusca])

  const catequistaSelecionado = catequistas.find((c) => c.id === catequistaId)

  function salvarMemoriaAparelho(id: string) {
    try {
      localStorage.setItem("catequista_presenca_id", id)
    } catch {
      // Ignora
    }
  }

  async function handleConfirmar() {
    if (!encontro || !catequistaId) return
    setLoading(true)
    setErro("")
    const res = await confirmarPresenca(encontro.id, catequistaId)
    if (res.error) {
      setErro(res.error)
    } else {
      salvarMemoriaAparelho(catequistaId)
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
      salvarMemoriaAparelho(catequistaId)
      setRespondido(true)
      setUltimaResposta({ presente: false, justificativa })
      setModoJustificar(false)
    }
    setLoading(false)
  }

  function handleSelecionar(id: string) {
    setCatequistaId(id)
    setTrocandoNome(false)
    setLembrado(true)
    salvarMemoriaAparelho(id)
  }

  function handleTrocarNome() {
    setTrocandoNome(true)
    setLembrado(false)
    setLetraAtiva("")
    setTermoBusca("")
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
          <p className="text-sm text-muted-foreground">
            {viaParametro ? "Registre sua presença neste encontro" : "Registre sua presença no próximo encontro"}
          </p>
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
            <CardContent className="p-6 space-y-5">
              {/* Catequista já selecionado / memorizado no aparelho */}
              {catequistaSelecionado && !trocandoNome ? (
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-base shrink-0">
                        {catequistaSelecionado.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {lembrado ? "👋 Olá, catequista!" : "Selecionado:"}
                        </p>
                        <p className="font-semibold text-sm sm:text-base text-foreground truncate">
                          {catequistaSelecionado.nome}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleTrocarNome}
                      className="text-xs text-primary hover:underline font-medium shrink-0 flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Trocar
                    </button>
                  </div>
                </div>
              ) : (
                /* Seleção rápida por letra inicial (Zero Digitação Obrigatória) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Selecione seu nome
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Toque na letra inicial
                    </span>
                  </div>

                  {/* Barra de Letras Iniciais (A-Z) */}
                  <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
                    <button
                      type="button"
                      onClick={() => setLetraAtiva("")}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                        letraAtiva === ""
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted/80 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Todas
                    </button>
                    {letrasDisponiveis.map((letra) => (
                      <button
                        type="button"
                        key={letra}
                        onClick={() => setLetraAtiva(letraAtiva === letra ? "" : letra)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                          letraAtiva === letra
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {letra}
                      </button>
                    ))}
                  </div>

                  {/* Campo de Busca Opcional */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Ou busque digitando..."
                      className="pl-8 pr-8 h-9 text-xs"
                    />
                    {termoBusca && (
                      <button
                        type="button"
                        onClick={() => setTermoBusca("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Lista de Nomes (Touch-friendly) */}
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 rounded-xl border border-border/40 p-1.5 bg-background/50">
                    {catequistasFiltrados.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        Nenhum nome encontrado.
                      </p>
                    ) : (
                      catequistasFiltrados.map((c) => {
                        const selecionado = catequistaId === c.id
                        return (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => handleSelecionar(c.id)}
                            className={`w-full min-h-[42px] px-3 py-2 rounded-lg text-left text-xs sm:text-sm flex items-center justify-between transition-all ${
                              selecionado
                                ? "bg-primary/15 border border-primary/40 text-primary font-semibold"
                                : "hover:bg-muted/70 text-foreground border border-transparent"
                            }`}
                          >
                            <span className="truncate pr-2">{c.nome}</span>
                            {selecionado && <Check className="h-4 w-4 text-primary shrink-0" />}
                          </button>
                        )
                      })
                    )}
                  </div>

                  {catequistasFiltrados.length > 0 && (
                    <p className="text-[11px] text-muted-foreground text-center">
                      {catequistasFiltrados.length} {catequistasFiltrados.length === 1 ? "catequista" : "catequistas"} exibidos
                    </p>
                  )}
                </div>
              )}

              {/* Ações: Confirmar / Justificar */}
              {modoJustificar ? (
                <div className="space-y-3 pt-2">
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
                <div className="space-y-2 pt-2">
                  <Button
                    className="w-full text-base h-12"
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
                    className="w-full h-10"
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

