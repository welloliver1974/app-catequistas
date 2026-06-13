"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { criarTurma, excluirTurma } from "@/actions/turmas"

interface Turma {
  id: string
  nome: string
  descricao: string
  totalCatequistas: number
  totalEncontros: number
}

function getInitials(name: string) {
  const parts = name.trim().split(" ")
  if (parts.length === 1) return parts[0].substring(0, 2)
  return (parts[0][0] + parts[parts.length - 1][0])
}

function getAvatarBgColor(name: string) {
  const colors = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-blue-500 to-sky-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-violet-500 to-fuchsia-500",
    "from-cyan-500 to-blue-500",
    "from-lime-500 to-green-500"
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export function TurmasClient({ turmas }: { turmas: Turma[] }) {
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Turma | null>(null)
  const [search, setSearch] = useState("")

  const filtrados = turmas.filter((t) =>
    t.nome.toLowerCase().includes(search.toLowerCase())
  )

  function abrirCriar() {
    setEditando(null)
    setAberto(true)
  }

  function abrirEditar(t: Turma) {
    setEditando(t)
    setAberto(true)
  }

  function fechar() {
    setAberto(false)
    setEditando(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir esta turma?")) {
      await excluirTurma(id)
    }
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Turmas</h1>
        <Button onClick={abrirCriar} className="h-8 text-xs sm:h-9 sm:text-sm gap-1">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nova Turma</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </header>

      <div className="p-4 sm:p-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-base">Todas as Turmas</CardTitle>
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-60 h-8 text-sm"
            />
          </CardHeader>
          <CardContent>
            {filtrados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma turma cadastrada. Clique em &quot;Nova Turma&quot; para começar.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Descrição</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Catequistas</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Encontros</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((t, i) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-2 font-medium">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase select-none shrink-0 bg-gradient-to-br ${getAvatarBgColor(t.nome)}`}>
                              {getInitials(t.nome)}
                            </div>
                            <span>{t.nome}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">{t.descricao || "—"}</td>
                        <td className="py-3 px-2 text-center hidden sm:table-cell">{t.totalCatequistas}</td>
                        <td className="py-3 px-2 text-center hidden sm:table-cell">{t.totalEncontros}</td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => abrirEditar(t)} className="p-1.5 rounded hover:bg-muted transition-colors">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
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

      {aberto && <TurmaForm turma={editando} onClose={fechar} />}
    </>
  )
}

function TurmaForm({ turma, onClose }: { turma: Turma | null; onClose: () => void }) {
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    const formData = new FormData(e.currentTarget)
    if (turma) {
      const { atualizarTurma } = await import("@/actions/turmas")
      await atualizarTurma(turma.id, formData)
    } else {
      await criarTurma(formData)
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
            {turma ? "Editar Turma" : "Nova Turma"}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome da turma</Label>
            <Input id="nome" name="nome" placeholder="Ex: Turma A - Sábado" defaultValue={turma?.nome ?? ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input id="descricao" name="descricao" placeholder="Ex: Encontros aos sábados às 15h" defaultValue={turma?.descricao ?? ""} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : turma ? "Salvar Alterações" : "Criar Turma"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
