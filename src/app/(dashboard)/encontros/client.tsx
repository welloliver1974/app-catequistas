"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { criarEncontro, excluirEncontro } from "@/actions/encontros"

interface Encontro {
  id: string
  data: string
  tema: string
  local: string
  linkPdf: string
  turma: string
  totalPresencas: number
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
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold">Encontros</h1>
        <Button onClick={abrirCriar}>
          <Plus className="h-4 w-4" />
          Novo Encontro
        </Button>
      </header>

      <div className="p-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Todos os Encontros</CardTitle>
            <Input
              placeholder="Buscar por tema..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-60 h-8 text-sm"
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
    </>
  )
}

function EncontroForm({ encontro, onClose }: { encontro: Encontro | null; onClose: () => void }) {
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
            <Input id="data" name="data" type="date" defaultValue={encontro ? toDateInput(encontro.data) : ""} required />
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
