import { prisma } from "@/lib/prisma"

const PUBLIC_VAPID_KEY = "BIkLFOKuZMM7tGPlpcHctDEMQnibyCUFQhX-cxSZR-nCyR86lUU6sgBpW0msazts567YeZvA8IhUiT-sdpIqeN8"
const PRIVATE_VAPID_KEY = "_JCe6HFXLfscGar_kCrX7rsH-Hd33S367wzVY4MC8KY"

// Salva ou atualiza uma subscription no banco
export async function salvarSubscription(subscription: object) {
  const subStr = JSON.stringify(subscription)
  const existing = await prisma.configuracao.findFirst({
    where: { chave: "push_subscription" },
  })
  if (existing) {
    await prisma.configuracao.update({
      where: { id: existing.id },
      data: { valor: subStr },
    })
  } else {
    await prisma.configuracao.create({
      data: { chave: "push_subscription", valor: subStr },
    })
  }
}

// Remove a subscription
export async function removerSubscription() {
  await prisma.configuracao.deleteMany({
    where: { chave: "push_subscription" },
  })
}

// Busca a subscription salva
async function getSubscription() {
  const config = await prisma.configuracao.findUnique({
    where: { chave: "push_subscription" },
  })
  return config?.valor ? JSON.parse(config.valor) : null
}

// Envia notificação push
export async function enviarPushNotificacao(titulo: string, corpo: string, url?: string) {
  try {
    const subscription = await getSubscription()
    if (!subscription) return

    const webpush = await import("web-push")
    webpush.setVapidDetails(
      "mailto:welloliver@gmail.com",
      PUBLIC_VAPID_KEY,
      PRIVATE_VAPID_KEY,
    )

    await webpush.sendNotification(subscription, JSON.stringify({
      title: titulo,
      body: corpo,
      icon: "/icons/icon-192.svg",
      badge: "/icons/icon-192.svg",
      data: { url: url || "/presenca" },
    }))
  } catch (e: any) {
    // Se a subscription expirou, remove
    if (e?.statusCode === 410) {
      await removerSubscription()
    }
  }
}

export { PUBLIC_VAPID_KEY }
