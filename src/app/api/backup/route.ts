import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const dbPath = join(process.cwd(), "dev.db")
    const buffer = await readFile(dbPath)
    const filename = `catequistas-backup-${new Date().toISOString().split("T")[0]}.db`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Erro ao ler o banco de dados." }, { status: 500 })
  }
}
