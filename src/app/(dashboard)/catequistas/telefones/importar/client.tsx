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

export function ImportarWhatsAppClient() {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numeros, setNumeros] = useState<string[]>([])
  const [semTelefone, setSemTelefone] = useState<Catequista[]>([])
  const [atribuicoes, setAtribuicoes] = useState<Record<string, string>>({}) // catequistaId -> numero
  const [saving, setSaving] = useState(false)
  const [resultado, setResultado] = useState<{ ok: number; err: number } | null>(null)

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

  function atribuir(catequistaId: string, numero: string) {
    setAtribuicoes((prev) => {
      const next = { ...prev }
      if (next[catequistaId] === numero) {
        delete next[catequistaId]
      } else {
        next[catequistaId] = numero
      }
      return next
    })
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
                    {n.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")}
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
                Clique no número ao lado do nome para associar.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {semTelefone.map((c) => (
                  <div key={c.id} className="px-4 sm:px-6 py-3 flex items-center gap-3">
                    <span className="flex-1 text-sm font-medium truncate">{c.nome}</span>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {numeros.map((n) => {
                        const ativo = atribuicoes[c.id] === n
                        return (
                          <button
                            key={n}
                            onClick={() => atribuir(c.id, n)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                              ativo
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/30 text-muted-foreground border-border/50 hover:border-primary/30"
                            }`}
                          >
                            {n.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3")}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
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
