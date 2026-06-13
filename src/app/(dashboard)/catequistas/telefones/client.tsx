"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Phone, Save, CheckCircle2, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { salvarTelefones } from "@/actions/catequistas"

interface Props {
  semTelefone: { id: string; nome: string }[]
  comTelefone: { id: string; nome: string; telefone: string }[]
}

export function TelefonesClient({ semTelefone, comTelefone }: Props) {
  const [numeros, setNumeros] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: number; err: number } | null>(null)

  function setNumero(id: string, value: string) {
    setNumeros((prev) => ({ ...prev, [id]: value }))
    setResultado(null)
  }

  const preenchidos = semTelefone.filter((c) => numeros[c.id]?.replace(/\D/g, "").length >= 10)

  async function handleSalvar() {
    setSalvando(true)
    setResultado(null)
    const dados = preenchidos.map((c) => ({
      id: c.id,
      telefone: numeros[c.id].replace(/\D/g, ""),
    }))
    const res = await salvarTelefones(dados)
    setResultado(res)
    setSalvando(false)
    if (res.ok > 0) {
      setNumeros({})
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
              <User className="h-4 w-4 text-primary" />
              Catequistas sem telefone ({semTelefone.length})
            </CardTitle>
            <CardDescription>
              Veja a lista de participantes do grupo no WhatsApp e digite o número ao lado de cada nome.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {semTelefone.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Todos os catequistas já têm telefone cadastrado!
              </p>
            ) : (
              <div className="divide-y divide-border/20">
                {semTelefone.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="flex items-center gap-3 px-4 sm:px-6 py-2.5 hover:bg-muted/20 transition-colors"
                  >
                    <span className="text-xs text-muted-foreground w-6 shrink-0 text-right">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium truncate min-w-0">
                      {c.nome}
                    </span>
                    <Input
                      value={numeros[c.id] ?? ""}
                      onChange={(e) => setNumero(c.id, e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-44 sm:w-56 h-8 text-sm font-mono"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {preenchidos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-primary/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {preenchidos.length} de {semTelefone.length} preenchidos
                  </p>
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
                Já cadastrados ({comTelefone.length})
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
      </div>
    </>
  )
}
