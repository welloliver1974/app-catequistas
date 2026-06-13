"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, FileText, Loader2, CheckCircle2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ExportarClient({ turmas }: { turmas: { id: string; nome: string }[] }) {
  const [exportando, setExportando] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState("")
  const [turmaId, setTurmaId] = useState("")

  function download(filename: string, content: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleExport(tipo: string) {
    setExportando(tipo)
    setMensagem("")
    try {
      const mod = await import("@/actions/exportar")
      let res: { filename: string; content: string }
      switch (tipo) {
        case "catequistas":
          res = await mod.exportarCatequistasCSV()
          break
        case "encontros":
          res = await mod.exportarEncontrosCSV()
          break
        case "presencas":
          res = await mod.exportarPresencasCSV()
          break
        case "frequencia":
          res = await mod.exportarFrequenciaCSV(turmaId || undefined)
          break
        default:
          return
      }
      download(res.filename, res.content)
      setMensagem(`${res.filename} baixado com sucesso!`)
    } catch (e) {
      setMensagem(`Erro: ${e instanceof Error ? e.message : String(e)}`)
    }
    setExportando(null)
  }

  function handlePrint() {
    window.print()
  }

  const exportItems = [
    { id: "catequistas", label: "Catequistas", desc: "Nome, email, telefone, status, turmas, presenças" },
    { id: "encontros", label: "Encontros", desc: "Data, tema, local, link PDF, turma, presenças" },
    { id: "presencas", label: "Presenças", desc: "Data, tema, catequista, presente/ausente, justificativa" },
    { id: "frequencia", label: "Frequência", desc: "Matriz de presença por catequista e encontro" },
  ]

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Exportar Dados</h1>
      </header>

      <div className="p-4 sm:p-6 max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Exportar CSV</CardTitle>
            <CardDescription>Baixe os dados do sistema em formato CSV (abre no Excel, Google Sheets, etc).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exportItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleExport(item.id)} disabled={exportando === item.id}>
                  {exportando === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
              <div className="flex-1">
                <Label htmlFor="turmaFreq" className="text-sm font-medium">Filtrar frequência por turma</Label>
                <select
                  id="turmaFreq"
                  value={turmaId}
                  onChange={(e) => setTurmaId(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm mt-1"
                >
                  <option value="">Todas as turmas</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleExport("frequencia")} disabled={exportando === "frequencia"}>
                {exportando === "frequencia" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>

            {mensagem && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-primary pt-2">
                <CheckCircle2 className="h-4 w-4" />
                {mensagem}
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="text-base">Exportar PDF</CardTitle>
            <CardDescription>Use a impressão do navegador para salvar como PDF.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Abra a página que deseja exportar e use a impressão do navegador (Ctrl+P / Cmd+P) para salvar como PDF.
            </p>
            <Button variant="outline" onClick={handlePrint}>
              <FileText className="h-4 w-4" />
              Abrir Impressão (PDF)
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="text-base">Backup do Banco</CardTitle>
            <CardDescription>Baixe uma cópia completa do banco de dados SQLite.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              O backup inclui todos os dados: catequistas, encontros, presenças, turmas e usuários.
            </p>
            <a href="/api/backup" download>
              <Button variant="outline">
                <Database className="h-4 w-4" />
                Baixar Backup (.db)
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
