"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Database, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { importarGoogleSheet } from "@/actions/importar"

export function ImportarClient() {
  const [resultado, setResultado] = useState<{ success?: string; error?: string } | null>(null)
  const [importando, setImportando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setImportando(true)
    setResultado(null)
    const formData = new FormData(e.currentTarget)
    const res = await importarGoogleSheet(formData)
    setResultado(res)
    setImportando(false)
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Importar Dados</h1>
      </header>

      <div className="p-4 sm:p-6 max-w-2xl">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Importar do Google Sheets</CardTitle>
            <CardDescription>
              Importe os dados das 3 abas da sua planilha atual para o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="sheetUrl">Link da Planilha</Label>
                <Input
                  id="sheetUrl"
                  name="sheetUrl"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A planilha precisa estar compartilhada como &quot;Qualquer um com o link pode ver&quot;
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">Chave da API Google</Label>
                <Input
                  id="apiKey"
                  name="apiKey"
                  type="password"
                  placeholder="AIzaSy..."
                  required
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">O que importar:</p>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer">
                  <input type="checkbox" name="importarCatequistas" defaultChecked className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Catequistas</p>
                    <p className="text-xs text-muted-foreground">Aba &quot;ListaCatequistas&quot; (coluna A)</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer">
                  <input type="checkbox" name="importarEncontros" defaultChecked className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Encontros</p>
                    <p className="text-xs text-muted-foreground">Aba &quot;Temas&quot; (colunas A-D: Data, Tema, Local, Link PDF)</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer">
                  <input type="checkbox" name="importarPresencas" defaultChecked className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Presenças</p>
                    <p className="text-xs text-muted-foreground">Aba &quot;Presencas&quot; (colunas A-C: Timestamp, Nome, Tema)</p>
                  </div>
                </label>
              </div>

              <Button type="submit" disabled={importando} className="w-full">
                {importando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importar
                  </>
                )}
              </Button>
            </form>

            {resultado && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg border ${
                  resultado.success
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-red-500/10 border-red-500/30 text-red-600"
                }`}
              >
                <div className="flex items-start gap-2">
                  {resultado.success ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm">{resultado.success || resultado.error}</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="text-base">Como obter a chave da API</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Acesse <a href="https://console.cloud.google.com" target="_blank" className="text-primary hover:underline">console.cloud.google.com</a></p>
            <p>2. Crie um projeto (ou selecione um existente)</p>
            <p>3. Vá em <strong>APIs e Serviços &gt; Biblioteca</strong></p>
            <p>4. Busque por &quot;Google Sheets API&quot; e ative</p>
            <p>5. Vá em <strong>APIs e Serviços &gt; Credenciais</strong></p>
            <p>6. Crie uma <strong>Chave de API</strong> (restrita ao Sheets API)</p>
            <p>7. Copie a chave e cole no campo acima</p>
            <p className="pt-2 text-xs">💡 Depois pode salvar no <code className="text-primary">.env</code> como <code className="text-primary">GOOGLE_API_KEY</code></p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
