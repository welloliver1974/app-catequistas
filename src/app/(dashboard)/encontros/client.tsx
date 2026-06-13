"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, ExternalLink, Sparkles, FileText, Loader2, BrainCircuit, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { criarEncontro, excluirEncontro } from "@/actions/encontros"
import { gerarResumo, gerarSumario, gerarConteudoTema } from "@/actions/ai"
import { DatePicker } from "@/components/ui/date-picker"

interface Encontro {
  id: string
  data: string
  tema: string
  local: string
  linkPdf: string
  turma: string
  totalPresencas: number
  resumo: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

function toDateInput(iso: string) {
  return new Date(iso).toISOString().split("T")[0]
}

export function EncontrosClient({ encontros }: { encontros: Encontro[] }) {
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Encontro | null>(null)
  const [detalhe, setDetalhe] = useState<Encontro | null>(null)
  const [search, setSearch] = useState("")

  const filtrados = encontros.filter((e) =>
    e.tema.toLowerCase().includes(search.toLowerCase())
  )

  function abrirCriar() {
    setEditando(null)
    setAberto(true)
  }

  function abrirEditar(e: Encontro) {
    setEditando(e)
    setAberto(true)
  }

  function fechar() {
    setAberto(false)
    setEditando(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este encontro?")) {
      await excluirEncontro(id)
    }
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Encontros</h1>
        <Button onClick={abrirCriar} className="h-8 text-xs sm:h-9 sm:text-sm gap-1">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Encontro</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </header>

      <div className="p-4 sm:p-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Todos os Encontros</CardTitle>
            <Input
              placeholder="Buscar por tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-60 h-8 text-sm"
            />
          </CardHeader>
          <CardContent>
            {filtrados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum encontro cadastrado. Clique em &quot;Novo Encontro&quot; para começar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Data</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tema</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Local</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Turma</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Presenças</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((e, i) => (
                      <motion.tr
                        key={e.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-2">{formatDate(e.data)}</td>
                        <td className="py-3 px-2 font-medium">{e.tema}</td>
                        <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{e.local || "—"}</td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{e.turma}</td>
                        <td className="py-3 px-2 text-center">{e.totalPresencas}</td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {e.linkPdf && (
                              <a href={e.linkPdf} target="_blank" className="p-1.5 rounded hover:bg-muted transition-colors">
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </a>
                            )}
                            <button onClick={() => setDetalhe(e)} className="p-1.5 rounded hover:bg-primary/10 transition-colors" title="Resumo do Encontro">
                              <Sparkles className="h-4 w-4 text-primary" />
                            </button>
                            <button onClick={() => abrirEditar(e)} className="p-1.5 rounded hover:bg-muted transition-colors">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {aberto && <EncontroForm encontro={editando} onClose={fechar} />}
      {detalhe && <EncontroDetalhe encontro={detalhe} onClose={() => setDetalhe(null)} />}
    </>
  )
}

function EncontroDetalhe({ encontro, onClose }: { encontro: Encontro; onClose: () => void }) {
  const [resumo, setResumo] = useState(encontro.resumo || "")
  const [inputTexto, setInputTexto] = useState("")
  const [gerando, setGerando] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [falando, setFalando] = useState(false)

  function ouvirResumo() {
    if (!("speechSynthesis" in window)) {
      alert("Seu navegador não suporta síntese de voz.")
      return
    }
    window.speechSynthesis.cancel()
    const texto = resumo.trim()
    if (!texto) return
    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = "pt-BR"
    utterance.rate = 0.95
    utterance.pitch = 1
    // Tenta selecionar voz pt-BR se disponível
    const vozes = window.speechSynthesis.getVoices()
    const vozPtBR = vozes.find((v) => v.lang === "pt-BR") || vozes.find((v) => v.lang.startsWith("pt"))
    if (vozPtBR) utterance.voice = vozPtBR
    utterance.onstart = () => setFalando(true)
    utterance.onend = () => setFalando(false)
    utterance.onerror = () => setFalando(false)
    window.speechSynthesis.speak(utterance)
  }

  function pararResumo() {
    window.speechSynthesis.cancel()
    setFalando(false)
  }

  async function handleGerarResumo() {
    if (!inputTexto.trim()) return
    setGerando(true)
    setMsg(null)
    const res = await gerarResumo(encontro.id, inputTexto)
    if (res.resumo) setResumo(res.resumo)
    setMsg({ type: res.success ? "success" : "error", text: res.success || res.error || "" })
    setGerando(false)
  }

  async function handleGerarConteudo() {
    setGerando(true)
    setMsg(null)
    const res = await gerarConteudoTema(encontro.id, encontro.tema)
    if (res.conteudo) setResumo(res.conteudo)
    setMsg({ type: res.success ? "success" : "error", text: res.success || res.error || "" })
    setGerando(false)
  }

  async function handleGerarSumario() {
    setGerando(true)
    setMsg(null)
    const res = await gerarSumario(encontro.id)
    setMsg({ type: res.success ? "success" : "error", text: res.success || res.error || "" })
    setGerando(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border/50 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{encontro.tema}</h2>
            <span className="text-sm text-muted-foreground">{new Date(encontro.data).toLocaleDateString("pt-BR")}</span>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGerarConteudo} disabled={gerando} size="sm" className="gap-2">
              {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {gerando ? "Gerando..." : "Gerar Conteúdo do Tema"}
            </Button>
            <p className="text-xs text-muted-foreground self-center">
              Gera explicação, passagens bíblicas, reflexão e perguntas a partir do tema.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Texto do Coordenador</Label>
            <textarea
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder="Descreva o que foi discutido no encontro..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button onClick={handleGerarResumo} disabled={gerando || !inputTexto.trim()} size="sm" className="gap-2">
              {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {gerando ? "Gerando..." : "Gerar Resumo com IA"}
            </Button>
          </div>

          {resumo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Resumo</Label>
                {falando ? (
                  <button
                    onClick={pararResumo}
                    className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive/80 transition-colors"
                  >
                    <VolumeX className="h-4 w-4" />
                    Parar áudio
                  </button>
                ) : (
                  <button
                    onClick={ouvirResumo}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <Volume2 className="h-4 w-4" />
                    Ouvir resumo
                  </button>
                )}
              </div>
              <div className={`p-4 rounded-lg bg-muted/30 text-sm whitespace-pre-wrap leading-relaxed transition-all ${
                falando ? "ring-1 ring-primary/40 bg-primary/5" : ""
              }`}>
                {resumo}
              </div>
            </div>
          )}

          <div className="border-t border-border/40 pt-4">
            <Button onClick={handleGerarSumario} disabled={gerando} variant="outline" size="sm" className="gap-2">
              {gerando ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              {gerando ? "Gerando..." : "Gerar Sumário Automático"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Sumário executivo com dados de presença, ausências e justificativas.
            </p>
          </div>

          {msg && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-sm flex items-center gap-1 ${msg.type === "success" ? "text-primary" : "text-destructive"}`}
            >
              {msg.type === "success" ? <FileText className="h-3 w-3" /> : null}
              {msg.text}
            </motion.p>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function EncontroForm({ encontro, onClose }: { encontro: Encontro | null; onClose: () => void }) {
  const [data, setData] = useState(encontro ? toDateInput(encontro.data) : "")
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    const formData = new FormData(e.currentTarget)
    if (encontro) {
      const { atualizarEncontro } = await import("@/actions/encontros")
      await atualizarEncontro(encontro.id, formData)
    } else {
      await criarEncontro(formData)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border/50 rounded-xl shadow-2xl w-full max-w-lg mx-4"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">
            {encontro ? "Editar Encontro" : "Novo Encontro"}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="data">Data</Label>
            <DatePicker value={data} onChange={setData} />
            <input type="hidden" name="data" value={data} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tema">Tema</Label>
            <Input id="tema" name="tema" placeholder="Ex: Encontro 5" defaultValue={encontro?.tema ?? ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="local">Local</Label>
            <Input id="local" name="local" placeholder="Paróquia São José" defaultValue={encontro?.local ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkPdf">Link do PDF (Google Drive)</Label>
            <Input id="linkPdf" name="linkPdf" placeholder="https://drive.google.com/..." defaultValue={encontro?.linkPdf?.startsWith("/uploads") ? "" : encontro?.linkPdf ?? ""} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdfFile">Ou enviar PDF diretamente</Label>
            <Input id="pdfFile" name="pdfFile" type="file" accept=".pdf" />
            {encontro?.linkPdf?.startsWith("/uploads") && (
              <p className="text-xs text-muted-foreground">Arquivo atual: {encontro.linkPdf.split("/").pop()}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : encontro ? "Salvar Alterações" : "Criar Encontro"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
