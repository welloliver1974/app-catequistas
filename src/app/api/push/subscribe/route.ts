import { NextRequest, NextResponse } from "next/server"
import { salvarSubscription, removerSubscription } from "@/lib/push"

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json()
    await salvarSubscription(subscription)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao salvar inscrição." }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await removerSubscription()
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: "Erro ao remover inscrição." }, { status: 500 })
  }
}
