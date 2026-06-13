"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Church, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export function RecuperarSenhaClient() {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Simula envio — sem infra de email ainda
    await new Promise((r) => setTimeout(r, 1000))
    setEnviado(true)
    setLoading(false)
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm text-center space-y-4"
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">E-mail enviado</h1>
          <p className="text-sm text-muted-foreground">
            Se o e-mail <strong>{email}</strong> estiver cadastrado, você receberá instruções para redefinir sua senha.
          </p>
          <p className="text-xs text-muted-foreground">
            (Funcionalidade de e-mail ainda não configurada — solicite ao administrador)
          </p>
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-3 w-3" /> Voltar ao login
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Church className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Recuperar Senha</h1>
          <p className="text-sm text-muted-foreground">
            Digite seu e-mail para receber instruções de recuperação.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : "Enviar Instruções"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">Voltar ao login</Link>
        </p>
      </motion.div>
    </div>
  )
}
