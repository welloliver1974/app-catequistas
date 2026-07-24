import { NextResponse } from "next/server"
import { PUBLIC_VAPID_KEY } from "@/lib/push"

export async function GET() {
  return NextResponse.json({ publicKey: PUBLIC_VAPID_KEY })
}
