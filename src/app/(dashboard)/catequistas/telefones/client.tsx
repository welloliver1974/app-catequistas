"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Save, CheckCircle2, XCircle, Loader2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { salvarTelefones } from "@/actions/catequistas"

interface Props {
  semTelefone: { id: string; nome: string }[]
  comTelefone: { id: string; nome: string; telefone: string }[]
}

function formatPhone(v: string) {
  const digits = v.replace(/\D/g, "")
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return v
}

export function TelefonesClient({ semTelefone, comTelefone }: Props) {
  const [batchInput, setBatchInput] = useState("")
  const [preview, setPreview] = useState<{ id: string; nome: string; telefone: string }[] | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: number; err: number } | null>(null)
  const [erro, setErro] = useState("")

  function handlePreview() {
    const lines = batchInput.split("\n").map((l) => l.trim()).filter(Boolean)
    const numeros = lines.map((l) => l.replace(/\D/g, ""))

    if (numeros.length !== semTelefone.length) {
      setErro(`Você colou ${numeros.length} números, mas há ${semTelefone.length} catequistas sem telefone.`);
      setPreview(null);
      return
    }

    setErro("")
    const matched = semTelefone.map((c, i) => ({
      id: c.id,
      nome: c.nome,
      telefone: numeros[i],
    }))
    setPreview(matched)
  }

  async function handleSalvar() {
    if (!preview) return
    setSalvando(true)
    setResultado(null)
    const res = await salvarTelefones(preview.map((p) => ({ id: p.id, telefone: p.telefone })))
    setResultado(res)
    setSalvando(false)
    if (res.ok > 0) {
      setPreview(null)
      setBatchInput("")
    }
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Telefones dos Catequistas</h1>
      </header>

      <div className="p-4 sm:p-6 space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" />
              Colar números do WhatsApp
            </CardTitle>
            <CardDescription>
              Exporte a lista de participantes do grupo no WhatsApp Web, copie os números e cole abaixo.
              A ordem dos números deve corresponder à ordem alfabética dos nomes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Números dos participantes ({semTelefone.length} catequistas aguardando)</Label>
              <textarea
                value={batchInput}
                onChange={(e) => { setBatchInput(e.target.value); setPreview(null); setErro("") }}
                placeholder="55 11 99999-9999&#10;55 11 98888-8888&#10;..."
                className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
              />
            </div>

            {erro && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" />
                {erro}
              </p>
            )}

            <Button onClick={handlePreview} disabled={!batchInput.trim() || preview !== null} className="gap-2">
              <Phone className="h-4 w-4" />
              Pré-visualizar correspondência
            </Button>
          </CardContent>
        </Card>

        {preview && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Correspondência encontrada — confirma?
                </CardTitle>
                <CardDescription>
                  {preview.length} catequistas serão vinculados aos números abaixo.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Catequista</th>
                        <th className="text-left py-2 px-2 font-medium text-muted-foreground">Telefone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p, i) => (
                        <motion.tr
                          key={p.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="border-b border-border/20"
                        >
                          <td className="py-2 px-2 font-medium">{p.nome}</td>
                          <td className="py-2 px-2">{formatPhone(p.telefone)}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => setPreview(null)} variant="outline">
                    Cancelar
                  </Button>
                  <Button onClick={handleSalvar} disabled={salvando} className="gap-2">
                    {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {salvando ? "Salvando..." : "Salvar telefones"}
                  </Button>
                </div>

                {resultado && (
                  <p className="text-sm text-primary flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {resultado.ok} salvos{resultado.err > 0 ? `, ${resultado.err} com erro` : ""}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {comTelefone.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                Catequistas com telefone ({comTelefone.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Telefone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comTelefone.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/20 hover:bg-muted/30"
                      >
                        <td className="py-3 px-4 font-medium">{c.nome}</td>
                        <td className="py-3 px-4 text-muted-foreground">{c.telefone}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {semTelefone.length === 0 && comTelefone.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum catequista cadastrado.</p>
        )}
      </div>
    </>
  )
}
