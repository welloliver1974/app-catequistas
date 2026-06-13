import { readFile, stat } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const BACKUP_DIR = join(process.cwd(), "backups")

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params
    const backupPath = join(BACKUP_DIR, name)

    await stat(backupPath)
    const buffer = await readFile(backupPath)

    const filename = name.replace(/^backup-/, "catequistas-backup-")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Backup não encontrado." }, { status: 404 })
  }
}
