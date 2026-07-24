"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushManager() {
  const [suportado, setSuportado] = useState(false)
  const [ativo, setAtivo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [permissaoNegada, setPermissaoNegada] = useState(false)

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return
    }
    setSuportado(true)

    // Verifica se já está inscrito
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setAtivo(!!sub)
      })
    })

    if (Notification.permission === "denied") {
      setPermissaoNegada(true)
    }
  }, [])

  async function ativar() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready

      // Busca a chave pública VAPID
      const res = await fetch("/api/push/vapid-public-key")
      const { publicKey } = await res.json()

      const keyBuffer = urlBase64ToUint8Array(publicKey)
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBuffer.buffer as ArrayBuffer,
      })

      // Salva no servidor
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      })

      setAtivo(true)
    } catch (e: any) {
      if (e?.name === "NotAllowedError") {
        setPermissaoNegada(true)
      }
    }
    setLoading(false)
  }

  async function desativar() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      await sub?.unsubscribe()
      await fetch("/api/push/subscribe", { method: "DELETE" })
      setAtivo(false)
    } catch {}
    setLoading(false)
  }

  if (!suportado) return null

  if (permissaoNegada) {
    return (
      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm space-y-2">
        <div className="flex items-center gap-2 text-yellow-600 font-medium">
          <BellOff className="h-4 w-4" />
          Notificações bloqueadas
        </div>
        <p className="text-xs text-muted-foreground">
          Permissão negada pelo navegador. Acesse as configurações do site e permita notificações.
        </p>
      </div>
    )
  }

  return (
    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ativo ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
          <span className={ativo ? "text-primary font-medium" : "text-muted-foreground"}>
            {ativo ? "Notificações ativas" : "Notificações inativas"}
          </span>
        </div>
        <Button
          variant={ativo ? "outline" : "default"}
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={ativo ? desativar : ativar}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : ativo ? (
            "Desativar"
          ) : (
            "Ativar"
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {ativo
          ? "Você receberá notificações quando catequistas confirmarem presença ou justificarem ausência."
          : "Ative para receber notificações no celular mesmo com o app fechado."}
      </p>
    </div>
  )
}
