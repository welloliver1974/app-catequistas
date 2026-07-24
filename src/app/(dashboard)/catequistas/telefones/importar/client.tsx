"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Phone, CheckCircle2, User, Save, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { parseWhatsAppExport, salvarTelefonesImportados } from "@/actions/importar-whatsapp"
import Link from "next/link"

interface Catequista {
  id: string
  nome: string
  telefone: string | null
}

function formatTel(raw: string) {
  const s = raw.replace(/\D/g, "").replace(/^55/, "")
  if (s.length >= 12) return `${s.slice(0,2)} ${s.slice(2,7)}-${s.slice(7)}`
  if (s.length === 11) return `(${s.slice(0,2)}) ${s.slice(2,7)}-${s.slice(7)}`
  if (s.length === 10) return `(${s.slice(0,2)}) ${s.slice(2,6)}-${s.slice(6)}`
  return raw
}

export function ImportarWhatsAppClient() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numeros, setNumeros] = useState<string[]>([])
  const [semTelefone, setSemTelefone] = useState<Catequista[]>([])
  const [atribuicoes, setAtribuicoes] = useState<Record<string, string>>({}) // catequistaId -> numero
  const [saving, setSaving] = useState(false)
  const [resultado, setResultado] = useState<{ ok: number; err: number } | null>(null)
  const [filtro, setFiltro] = useState("")

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!arquivo) return
    setLoading(true)
    setError(null)
    setNumeros([])
    setAtribuicoes({})

    const formData = new FormData()
    formData.set("arquivo", arquivo)
    const res = await parseWhatsAppExport(formData)

    if (res.error) {
      setError(res.error)
      setLoading(false)
      return
    }

    setNumeros(res.numerosEncontrados || [])
    setSemTelefone(res.catequistasSemTelefone || [])

    // Pré-atribui automático: se só 1 catequista sem telefone e 1 número, já associa
    const semTel = res.catequistasSemTelefone || []
    const novos = res.numerosNovos || []
    if (semTel.length === 1 && novos.length === 1) {
      setAtribuicoes({ [semTel[0].id]: novos[0] })
    }

    setLoading(false)
  }

  async function handleSalvar() {
    setSaving(true)
    const dados = Object.entries(atribuicoes).map(([id, tel]) => ({
      catequistaId: id,
      telefone: tel,
    }))
    const res = await salvarTelefonesImportados(dados)
    setResultado(res)
    setSaving(false)
  }

  const temAtribuicoes = Object.keys(atribuicoes).length > 0

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6 gap-3">
        <Link href="/catequistas/telefones" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Importar do WhatsApp</h1>
      </header>

      <div className="p-4 sm:p-6 max-w-2xl space-y-6">

        {/* Explicação */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> Exportar do WhatsApp
            </CardTitle>
            <CardDescription>
              Exporte a conversa do grupo e faça upload do arquivo .txt para extrair os telefones.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong>No celular (Android):</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Abra o grupo do WhatsApp</li>
              <li>Toque nos ⋮ (3 pontinhos) &gt; Mais &gt; Exportar conversa</li>
              <li>Escolha <strong>Sem mídia</strong></li>
              <li>Salve no Google Drive ou envie para você mesmo por email</li>
            </ol>
            <p className="mt-2"><strong>No WhatsApp Web:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Seta ▼ ao lado do nome do grupo &gt; Exportar conversa</li>
              <li>O arquivo .txt será baixado</li>
            </ol>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => setArquivo(e.target.files?.[0] || null)}
                  className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <Button type="submit" disabled={!arquivo || loading} className="gap-2 shrink-0">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {loading ? "Processando..." : "Analisar"}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {error}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Números encontrados */}
        {numeros.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">
                {numeros.length} número{numeros.length !== 1 ? "s" : ""} encontrado{numeros.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {numeros.map((n) => (
                  <span key={n} className="px-3 py-1 rounded-full bg-muted text-xs font-mono">
                    {formatTel(n)}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Atribuir números */}
        {semTelefone.length > 0 && numeros.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Atribuir números aos catequistas
              </CardTitle>
              <CardDescription>
                Para cada catequista, selecione o número correspondente no dropdown.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Filtro */}
              <div className="px-4 sm:px-6 py-3 border-b border-border/20">
                <input
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  placeholder="Filtrar números... digite os últimos dígitos"
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="divide-y divide-border/20">
                {semTelefone.map((c) => {
                  const numerosFiltrados = numeros.filter((n) => {
                    const jaUsado = Object.values(atribuicoes).includes(n)
                    if (atribuicoes[c.id] !== n && jaUsado) return false
                    if (!filtro) return true
                    return n.replace(/\D/g, "").includes(filtro.replace(/\D/g, ""))
                  })
                  return (
                    <div key={c.id} className="px-4 sm:px-6 py-3 flex items-center gap-3">
                      <span className="flex-1 text-sm font-medium truncate">{c.nome}</span>
                      <select
                        value={atribuicoes[c.id] || ""}
                        onChange={(e) => {
                          setAtribuicoes((prev) => {
                            const next = { ...prev }
                            if (e.target.value) {
                              next[c.id] = e.target.value
                            } else {
                              delete next[c.id]
                            }
                            return next
                          })
                        }}
                        className="w-48 h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs font-mono"
                      >
                        <option value="">— selecione —</option>
                        {numerosFiltrados.map((n) => (
                          <option key={n} value={n}>
                            {formatTel(n)}
                          </option>
                        ))}
                      </select>
                      {atribuicoes[c.id] && (
                        <button
                          onClick={() => {
                            setAtribuicoes((prev) => {
                              const next = { ...prev }
                              delete next[c.id]
                              return next
                            })
                          }}
                          className="text-xs text-muted-foreground hover:text-red-500"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Salvar */}
        {temAtribuicoes && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button onClick={handleSalvar} disabled={saving} className="w-full gap-2 h-11">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Salvando..." : `Salvar ${Object.keys(atribuicoes).length} telefone(s)`}
            </Button>
            {resultado && (
              <p className="text-sm text-primary text-center mt-2 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {resultado.ok} salvo(s){resultado.err > 0 ? `, ${resultado.err} com erro` : ""}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </>
  )
}
