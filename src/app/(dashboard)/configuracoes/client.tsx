"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Save, Mail, Lock, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { changeEmail, resetPassword } from "@/actions/auth"

interface Props {
  user: { id: string; email: string; name: string }
}

export function ConfiguracoesClient({ user }: Props) {
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
      <header className="h-16 border-b border-border/40 flex items-center px-6">
        <h1 className="text-lg font-semibold">Configurações</h1>
      </header>

      <div className="p-6 max-w-xl mx-auto space-y-6">
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
    </>
  )
}
