import { getUser } from "@/actions/auth"
import { getConfigAi } from "@/actions/ai"
import { redirect } from "next/navigation"
import { ConfiguracoesClient } from "./client"

export const dynamic = "force-dynamic"

export default async function ConfiguracoesPage() {
  const user = await getUser()
  if (!user) redirect("/login")

  const aiConfig = await getConfigAi()

  return (
    <ConfiguracoesClient
      user={{ id: user.id, email: user.email, name: user.name ?? "" }}
      aiConfig={aiConfig}
    />
  )
}
