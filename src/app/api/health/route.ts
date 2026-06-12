import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const catequistas = await prisma.catequista.count()
    const encontros = await prisma.encontro.count()
    return Response.json({ status: "ok", catequistas, encontros })
  } catch (e) {
    return Response.json({ status: "error", message: String(e) }, { status: 500 })
  }
}
