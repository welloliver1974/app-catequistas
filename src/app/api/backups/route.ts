import { readdir, stat, unlink, copyFile } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const BACKUP_DIR = join(process.cwd(), "backups")

export async function GET() {
  try {
    await stat(BACKUP_DIR).catch(() => null)
    const dir = await readdir(BACKUP_DIR).catch(() => [])
    const backups = await Promise.all(
      dir
        .filter((f) => f.endsWith(".db"))
        .map(async (name) => {
          const s = await stat(join(BACKUP_DIR, name))
          return { name, size: s.size, date: s.mtime.toISOString() }
        })
    )
    backups.sort((a, b) => b.date.localeCompare(a.date))
    return NextResponse.json({ backups })
  } catch {
    return NextResponse.json({ error: "Erro ao listar backups." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { action, name } = await req.json()

    if (action === "criar") {
      const dbPath = join(process.cwd(), "dev.db")
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const backupName = `backup-${timestamp}.db`
      await copyFile(dbPath, join(BACKUP_DIR, backupName))

      const s = await stat(join(BACKUP_DIR, backupName))
      return NextResponse.json({
        success: "Backup criado com sucesso!",
        backup: { name: backupName, size: s.size, date: s.mtime.toISOString() },
      })
    }

    if (action === "restaurar") {
      if (!name) {
        return NextResponse.json({ error: "Nome do backup é obrigatório." }, { status: 400 })
      }

      const dbPath = join(process.cwd(), "dev.db")
      const backupPath = join(BACKUP_DIR, name)

      await stat(backupPath)
      await copyFile(backupPath, dbPath)

      return NextResponse.json({ success: "Backup restaurado com sucesso! Faça uma nova requisição para carregar os dados." })
    }

    if (action === "excluir") {
      if (!name) {
        return NextResponse.json({ error: "Nome do backup é obrigatório." }, { status: 400 })
      }

      await unlink(join(BACKUP_DIR, name))
      return NextResponse.json({ success: "Backup excluído." })
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Erro ao processar backup." }, { status: 500 })
  }
}
