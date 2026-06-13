"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send, Loader2, CheckCircle2, AlertCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { enviarNotificacaoDiscord, notificarProximoEncontro } from "@/actions/notificacoes"
import { setConfig } from "@/actions/config"

interface Props {
  webhookSalvo: string
}

export function NotificacoesClient({ webhookSalvo }: Props) {
  const [webhookUrl, setWebhookUrl] = useState(webhookSalvo)
  const [mensagem, setMensagem] = useState("")
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ success?: string; error?: string } | null>(null)

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResultado(null)
    const res = await enviarNotificacaoDiscord(webhookUrl, mensagem)
    setResultado(res.success ? { success: "Mensagem enviada com sucesso!" } : { error: res.error })
    setLoading(false)
  }

  async function handleNotificarProximo() {
    setLoading(true)
    setResultado(null)
    const res = await notificarProximoEncontro(webhookUrl)
    setResultado(res.success ? { success: "Notificação do próximo encontro enviada!" } : { error: res.error })
    setLoading(false)
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Notificações</h1>
      </header>

      <div className="p-4 sm:p-6 max-w-2xl space-y-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Discord Webhook</CardTitle>
            <CardDescription>
              Envie notificações para um canal do Discord usando um webhook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-muted-foreground">
                <strong>Como criar:</strong> Discord &gt; Servidor &gt; Configurações &gt; Integrações &gt; Webhooks &gt; Novo Webhook
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook">URL do Webhook</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await setConfig("discord_webhook_url", webhookUrl)
                  }}
                >
                  Salvar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Salva permanentemente para notificações automáticas de presença.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem personalizada</Label>
              <Input
                id="mensagem"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Ex: Lembrando que amanhã tem encontro!"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleEnviar} disabled={loading || !webhookUrl || !mensagem} className="w-full sm:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar Mensagem
              </Button>
              <Button variant="outline" onClick={handleNotificarProximo} disabled={loading || !webhookUrl} className="w-full sm:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                Notificar Próximo Encontro
              </Button>
            </div>

            {resultado && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  resultado.success
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-red-500/10 text-red-600 border border-red-500/30"
                }`}
              >
                {resultado.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <p>{resultado.success || resultado.error}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>✅ Criar webhook no Discord e colar a URL acima</p>
            <p>✅ Enviar mensagem de teste</p>
            <p>🔲 Integrar notificação automática ao criar encontro</p>
            <p>🔲 Lembrete automático antes do encontro (precisa de cron job)</p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
