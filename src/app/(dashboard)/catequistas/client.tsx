"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Pencil, Trash2, Phone, Mail, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { criarCatequista, atualizarCatequista, excluirCatequista } from "@/actions/catequistas"

interface Catequista {
  id: string
  nome: string
  email: string
  telefone: string
  status: string
  dataEntrada: string
  observacoes: string
  turmas: string
  totalPresencas: number
  userId: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function CatequistasClient({ catequistas }: { catequistas: Catequista[] }) {
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Catequista | null>(null)
  const [search, setSearch] = useState("")

  const filtrados = catequistas.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase())
  )

  function abrirCriar() {
    setEditando(null)
    setAberto(true)
  }

  function abrirEditar(c: Catequista) {
    setEditando(c)
    setAberto(true)
  }

  function fechar() {
    setAberto(false)
    setEditando(null)
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este catequista?")) {
      await excluirCatequista(id)
    }
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-6">
        <h1 className="text-lg font-semibold">Catequistas</h1>
        <Button onClick={abrirCriar}>
          <Plus className="h-4 w-4" />
          Novo Catequista
        </Button>
      </header>

      <div className="p-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Todos os Catequistas</CardTitle>
            <Input
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-60 h-8 text-sm"
            />
          </CardHeader>
          <CardContent>
            {filtrados.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum catequista cadastrado.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nome</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden md:table-cell">Contato</th>
                      <th className="text-left py-3 px-2 font-medium text-muted-foreground hidden lg:table-cell">Turmas</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground">Status</th>
                      <th className="text-center py-3 px-2 font-medium text-muted-foreground hidden sm:table-cell">Pres.</th>
                      <th className="text-right py-3 px-2 font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((c, i) => (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <p className="font-medium">{c.nome}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{c.email}</p>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden md:table-cell">
                          <div className="flex flex-col gap-0.5">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                            {c.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.telefone}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-muted-foreground hidden lg:table-cell">{c.turmas || "—"}</td>
                        <td className="py-3 px-2 text-center">
                          {c.status === "ATIVO" ? (
                            <span className="inline-flex items-center gap-1 text-xs text-green-500">
                              <CheckCircle2 className="h-3 w-3" /> Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <XCircle className="h-3 w-3" /> Inativo
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center hidden sm:table-cell">{c.totalPresencas}</td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => abrirEditar(c)} className="p-1.5 rounded hover:bg-muted transition-colors">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors">
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

      {aberto && <CatequistaForm catequista={editando} onClose={fechar} />}
    </>
  )
}

function CatequistaForm({ catequista, onClose }: { catequista: Catequista | null; onClose: () => void }) {
  const [salvando, setSalvando] = useState(false)
  const [resetMsg, setResetMsg] = useState("")
  const [resetSenha, setResetSenha] = useState("")
  const [resetAberto, setResetAberto] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    const formData = new FormData(e.currentTarget)
    if (catequista) {
      const { atualizarCatequista } = await import("@/actions/catequistas")
      await atualizarCatequista(catequista.id, formData)
    } else {
      await criarCatequista(formData)
    }
    onClose()
  }

  async function handleResetSenha() {
    if (!catequista?.userId || !resetSenha.trim()) return
    setResetLoading(true)
    setResetMsg("")
    const { resetPassword } = await import("@/actions/auth")
    const res = await resetPassword(catequista.userId, resetSenha)
    setResetMsg(res.success ? "Senha redefinida com sucesso!" : res.error ?? "")
    setResetLoading(false)
    if (res.success) setResetSenha("")
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
            {catequista ? "Editar Catequista" : "Novo Catequista"}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" name="nome" placeholder="Nome do catequista" defaultValue={catequista?.nome ?? ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" placeholder="catequista@email.com" defaultValue={catequista?.email ?? ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone / WhatsApp</Label>
            <Input id="telefone" name="telefone" placeholder="(11) 99999-0000" defaultValue={catequista?.telefone ?? ""} />
          </div>

          {catequista && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={catequista.status}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="ATIVO">Ativo</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Input id="observacoes" name="observacoes" placeholder="Anotações adicionais" defaultValue={catequista?.observacoes ?? ""} />
          </div>

          {catequista?.userId && (
            <div className="pt-2 border-t border-border/40">
              <button type="button" onClick={() => setResetAberto(!resetAberto)} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {resetAberto ? "Cancelar" : "Redefinir senha"}
              </button>
              {resetAberto && (
                <div className="flex items-center gap-2 mt-2">
                  <Input placeholder="Nova senha" value={resetSenha} onChange={(e) => setResetSenha(e.target.value)} type="password" className="h-8 text-sm" />
                  <Button type="button" size="sm" onClick={handleResetSenha} disabled={resetLoading || !resetSenha.trim()}>
                    {resetLoading ? "..." : "Salvar"}
                  </Button>
                </div>
              )}
              {resetMsg && <p className={`text-xs mt-1 ${resetMsg.includes("sucesso") ? "text-green-500" : "text-destructive"}`}>{resetMsg}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : catequista ? "Salvar Alterações" : "Criar Catequista"}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
