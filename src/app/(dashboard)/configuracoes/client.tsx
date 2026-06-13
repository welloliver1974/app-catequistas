"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Mail, Lock, Download, Upload, Trash2, RotateCcw, Loader2, CheckCircle2, AlertCircle, HardDrive, Sparkles, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { changeEmail, resetPassword } from "@/actions/auth"
import { salvarConfigAi } from "@/actions/ai"
import { MODELOS_SUGERIDOS } from "@/lib/modelos-ai"

interface Backup {
  name: string
  size: number
  date: string
}

interface AiConfig {
  provider: string
  apiKey: string
  model: string
}

interface Props {
  user: { id: string; email: string; name: string }
  aiConfig: AiConfig
}

export function ConfiguracoesClient({ user, aiConfig }: Props) {
  const [aiProvider, setAiProvider] = useState(aiConfig.provider)
  const [aiApiKey, setAiApiKey] = useState(aiConfig.apiKey)
  const [aiModel, setAiModel] = useState(aiConfig.model)
  const [showKey, setShowKey] = useState(false)
  const [savingAi, setSavingAi] = useState(false)
  const [msgAi, setMsgAi] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [email, setEmail] = useState(user.email)
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmSenha, setConfirmSenha] = useState("")
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msgEmail, setMsgEmail] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [msgPass, setMsgPass] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setSavingEmail(true)
    setMsgEmail(null)

    if (email === user.email) {
      setMsgEmail({ type: "error", text: "O e-mail é o mesmo atual." })
      setSavingEmail(false)
      return
    }

    const res = await changeEmail(user.id, email)
    if (res.error) {
      setMsgEmail({ type: "error", text: res.error })
    } else {
      setMsgEmail({ type: "success", text: "E-mail alterado com sucesso!" })
    }
    setSavingEmail(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setSavingPass(true)
    setMsgPass(null)

    if (novaSenha.length < 4) {
      setMsgPass({ type: "error", text: "A senha deve ter pelo menos 4 caracteres." })
      setSavingPass(false)
      return
    }

    if (novaSenha !== confirmSenha) {
      setMsgPass({ type: "error", text: "As senhas não conferem." })
      setSavingPass(false)
      return
    }

    const res = await resetPassword(user.id, novaSenha)
    if (res.error) {
      setMsgPass({ type: "error", text: res.error })
    } else {
      setMsgPass({ type: "success", text: "Senha alterada com sucesso!" })
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmSenha("")
    }
    setSavingPass(false)
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Configurações</h1>
      </header>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> Alterar E-mail
              </CardTitle>
              <CardDescription>Altere o e-mail de login do administrador.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Novo e-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" disabled={savingEmail}>
                  {savingEmail ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4" /> Salvar E-mail</>}
                </Button>
                {msgEmail && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm flex items-center gap-1 ${msgEmail.type === "success" ? "text-primary" : "text-destructive"}`}
                  >
                    {msgEmail.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {msgEmail.text}
                  </motion.p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" /> Alterar Senha
              </CardTitle>
              <CardDescription>Altere a senha de acesso ao sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <Input id="novaSenha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmSenha">Confirmar senha</Label>
                  <Input id="confirmSenha" type="password" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} required minLength={4} />
                </div>
                <Button type="submit" disabled={savingPass}>
                  {savingPass ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4" /> Salvar Senha</>}
                </Button>
                {msgPass && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm flex items-center gap-1 ${msgPass.type === "success" ? "text-primary" : "text-destructive"}`}
                  >
                    {msgPass.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {msgPass.text}
                  </motion.p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" /> Backup do Banco
              </CardTitle>
              <CardDescription>Baixe uma cópia completa do banco de dados.</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/api/backup" download>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Baixar Backup (.db)
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Inteligência Artificial
              </CardTitle>
              <CardDescription>Configure a IA para gerar resumos de encontros e responder perguntas.</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setSavingAi(true)
                  setMsgAi(null)
                  const formData = new FormData()
                  formData.set("provider", aiProvider)
                  formData.set("apiKey", aiApiKey)
                  formData.set("model", aiModel)
                  await salvarConfigAi(formData)
                  setMsgAi({ type: "success", text: "Configuração salva!" })
                  setSavingAi(false)
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="groq">Groq (grátis)</option>
                    <option value="openrouter">OpenRouter</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Chave da API</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showKey ? "text" : "password"}
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder={aiProvider === "groq" ? "gsk_..." : "sk-or-..."}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 rounded hover:bg-muted transition-colors"
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {MODELOS_SUGERIDOS
                      .filter((m) => m.provider === aiProvider)
                      .map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                  </select>
                </div>

                <Button type="submit" disabled={savingAi} size="sm" className="gap-2">
                  {savingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {savingAi ? "Salvando..." : "Salvar Configuração"}
                </Button>

                {msgAi && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm flex items-center gap-1 ${msgAi.type === "success" ? "text-primary" : "text-destructive"}`}
                  >
                    {msgAi.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {msgAi.text}
                  </motion.p>
                )}
              </form>
            </CardContent>
          </Card>

          <BackupCard />
        </div>
      </div>
    </>
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function BackupCard() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)

  async function carregar() {
    setLoading(true)
    try {
      const res = await fetch("/api/backups")
      const data = await res.json()
      setBackups(data.backups ?? [])
    } catch { setBackups([]) }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function criarBackup() {
    setCriando(true)
    setMsg(null)
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        body: JSON.stringify({ action: "criar" }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: "success", text: data.success })
        carregar()
      } else {
        setMsg({ type: "error", text: data.error })
      }
    } catch { setMsg({ type: "error", text: "Erro ao criar backup." }) }
    setCriando(false)
  }

  async function restaurar(nome: string) {
    setRestaurando(nome)
    setMsg(null)
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        body: JSON.stringify({ action: "restaurar", name: nome }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: "success", text: data.success })
      } else {
        setMsg({ type: "error", text: data.error })
      }
    } catch { setMsg({ type: "error", text: "Erro ao restaurar backup." }) }
    setRestaurando(null)
    setConfirmRestore(null)
  }

  async function excluir(nome: string) {
    setMsg(null)
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        body: JSON.stringify({ action: "excluir", name: nome }),
      })
      const data = await res.json()
      if (data.success) {
        carregar()
      } else {
        setMsg({ type: "error", text: data.error })
      }
    } catch { setMsg({ type: "error", text: "Erro ao excluir backup." }) }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <HardDrive className="h-4 w-4" /> Gerenciar Backups
        </CardTitle>
        <CardDescription>Backups automáticos diários. Você também pode criar ou restaurar manualmente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={criarBackup} disabled={criando} size="sm" className="gap-2">
            {criando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {criando ? "Criando..." : "Criar Backup Agora"}
          </Button>
          <Button onClick={carregar} disabled={loading} variant="outline" size="sm" className="gap-2">
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Carregando backups...</p>
        ) : backups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum backup encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Tamanho</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {backups.map((b) => (
                    <motion.tr
                      key={b.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border/20 hover:bg-muted/30"
                    >
                      <td className="py-2 px-2 whitespace-nowrap">
                        {new Date(b.date).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 px-2 text-right text-muted-foreground whitespace-nowrap">
                        {formatSize(b.size)}
                      </td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`/api/backups/${encodeURIComponent(b.name)}`} download>
                            <button className="p-1.5 rounded hover:bg-muted transition-colors" title="Baixar">
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </a>
                          {confirmRestore === b.name ? (
                            <>
                              <button
                                onClick={() => restaurar(b.name)}
                                disabled={restaurando === b.name}
                                className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs font-medium"
                              >
                                {restaurando === b.name ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => setConfirmRestore(null)}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-xs"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmRestore(b.name)}
                              className="p-1.5 rounded hover:bg-amber-500/10 transition-colors"
                              title="Restaurar"
                            >
                              <RotateCcw className="h-4 w-4 text-amber-500" />
                            </button>
                          )}
                          <button
                            onClick={() => excluir(b.name)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {msg && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm flex items-center gap-1 ${msg.type === "success" ? "text-primary" : "text-destructive"}`}
          >
            {msg.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {msg.text}
          </motion.p>
        )}
      </CardContent>
    </Card>
  )
}
