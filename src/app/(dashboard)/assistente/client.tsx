"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, User, Loader2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { perguntarAoAssistente } from "@/actions/ai"

interface Mensagem {
  role: "user" | "assistant"
  content: string
}

const SUGESTOES = [
  "Quantos catequistas estão ativos?",
  "Qual encontro teve menos presença?",
  "Quantas turmas existem?",
  "Catequistas que mais faltaram?",
]

export function AssistenteClient() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    { role: "assistant", content: "Olá! Pergunte qualquer coisa sobre os catequistas, encontros, presenças ou turmas." },
  ])
  const [input, setInput] = useState("")
  const [carregando, setCarregando] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens])

  async function handleSend(pergunta?: string) {
    const texto = pergunta || input
    if (!texto.trim() || carregando) return

    setMensagens((prev) => [...prev, { role: "user", content: texto }])
    setInput("")
    setCarregando(true)

    const res = await perguntarAoAssistente(texto)
    setMensagens((prev) => [
      ...prev,
      { role: "assistant", content: res.success || res.error || "Erro ao processar." },
    ])
    setCarregando(false)
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" /> Assistente IA
        </h1>
      </header>

      <div className="p-4 sm:p-6 max-w-3xl mx-auto">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Faça perguntas sobre os dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  disabled={carregando}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Lightbulb className="h-3 w-3" />
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto p-2">
              <AnimatePresence>
                {mensagens.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-foreground"
                      }`}
                    >
                      {m.content}
                    </div>
                    {m.role === "user" && (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {carregando && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-muted-foreground pl-11"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pensando...
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); handleSend() }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                disabled={carregando}
              />
              <Button type="submit" disabled={carregando || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
