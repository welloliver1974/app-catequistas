"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Save, Mail, Lock, Download, Upload, Trash2, RotateCcw, Loader2, CheckCircle2, AlertCircle, HardDrive, Sparkles, Eye, EyeOff, Bell, MessageSquareText, RefreshCw, ExternalLink, Activity, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { changeEmail, resetPassword } from "@/actions/auth"
import { salvarConfigAi, listarModelosDisponiveis, testarConexaoAi } from "@/actions/ai"
import { salvarMural } from "@/actions/mural"
import { salvarWebhookUrl, getInfoSincronizacao, sincronizarPlanilhaDiocesana } from "@/actions/sincronizar"
import { MODELOS_SUGERIDOS, PROVIDERS_INFO, AiProvider } from "@/lib/modelos-ai"
import { PushManager } from "@/components/push/push-manager"

interface Backup {
  name: string
  size: number
  date: string
}

interface AiConfig {
  provider: string
  apiKey: string
  model: string
  customBaseUrl?: string
  keys?: Record<string, string>
}

interface Props {
  user: { id: string; email: string; name: string }
  aiConfig: AiConfig
}

export function ConfiguracoesClient({ user, aiConfig }: Props) {
  const initialProvider = ((aiConfig.provider as AiProvider) || "groq") as AiProvider
  const [aiProvider, setAiProvider] = useState<AiProvider>(initialProvider)
  const [keysByProvider, setKeysByProvider] = useState<Record<string, string>>(() => {
    return {
      groq: aiConfig.keys?.groq || (initialProvider === "groq" ? aiConfig.apiKey : ""),
      nvidia: aiConfig.keys?.nvidia || (initialProvider === "nvidia" ? aiConfig.apiKey : ""),
      openrouter: aiConfig.keys?.openrouter || (initialProvider === "openrouter" ? aiConfig.apiKey : ""),
      custom: aiConfig.keys?.custom || (initialProvider === "custom" ? aiConfig.apiKey : ""),
    }
  })
  const [aiApiKey, setAiApiKey] = useState(aiConfig.apiKey || "")
  const [aiModel, setAiModel] = useState(aiConfig.model || "llama-3.3-70b-versatile")
  const [customBaseUrl, setCustomBaseUrl] = useState(aiConfig.customBaseUrl || PROVIDERS_INFO.custom.baseUrl)
  const [showKey, setShowKey] = useState(false)
  const [savingAi, setSavingAi] = useState(false)
  const [testingAi, setTestingAi] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [fetchedModels, setFetchedModels] = useState<{ id: string; label: string }[]>([])
  const [isCustomModel, setIsCustomModel] = useState(false)
  const [customModelInput, setCustomModelInput] = useState("")
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null)
  const [msgAi, setMsgAi] = useState<{ type: "success" | "error"; text: string } | null>(null)

  function handleProviderChange(newProvider: AiProvider) {
    setKeysByProvider((prev) => ({ ...prev, [aiProvider]: aiApiKey }))
    setAiProvider(newProvider)

    const keyForNew = keysByProvider[newProvider] || ""
    setAiApiKey(keyForNew)

    setFetchedModels([])
    setTestResult(null)
    setMsgAi(null)
    setIsCustomModel(false)

    const defaultModel =
      MODELOS_SUGERIDOS.find((m) => m.provider === newProvider)?.value || ""
    setAiModel(defaultModel)
  }

  async function handleListarModelos() {
    if (!aiApiKey && aiProvider !== "custom") {
      setMsgAi({ type: "error", text: "Informe a chave da API para consultar os modelos disponíveis." })
      return
    }
    setLoadingModels(true)
    setMsgAi(null)
    setTestResult(null)
    const res = await listarModelosDisponiveis(aiProvider, aiApiKey, customBaseUrl)
    if (res.error) {
      setMsgAi({ type: "error", text: res.error })
    } else if (res.modelos) {
      setFetchedModels(res.modelos)
      setMsgAi({ type: "success", text: `${res.modelos.length} modelos encontrados na API!` })
      if (res.modelos.length > 0 && !res.modelos.some((m) => m.id === aiModel)) {
        setAiModel(res.modelos[0].id)
      }
    }
    setLoadingModels(false)
  }

  async function handleTestarConexao() {
    const modelToTest = isCustomModel ? customModelInput.trim() : aiModel
    if (!modelToTest) {
      setTestResult({ success: false, text: "Selecione ou digite um modelo para testar." })
      return
    }
    setTestingAi(true)
    setTestResult(null)
    setMsgAi(null)
    const res = await testarConexaoAi(aiProvider, aiApiKey, modelToTest, customBaseUrl)
    if (res.error) {
      setTestResult({ success: false, text: res.error })
    } else {
      setTestResult({ success: true, text: `${res.message} (Resposta: "${res.resposta}")` })
    }
    setTestingAi(false)
  }

  async function handleSalvarAi(e: React.FormEvent) {
    e.preventDefault()
    setSavingAi(true)
    setMsgAi(null)
    const modelToSave = isCustomModel ? customModelInput.trim() : aiModel
    if (!modelToSave) {
      setMsgAi({ type: "error", text: "Por favor informe o modelo desejado." })
      setSavingAi(false)
      return
    }

    const formData = new FormData()
    formData.set("provider", aiProvider)
    formData.set("apiKey", aiApiKey)
    formData.set("model", modelToSave)
    if (aiProvider === "custom") {
      formData.set("customBaseUrl", customBaseUrl)
    }

    const res = await salvarConfigAi(formData)
    setKeysByProvider((prev) => ({ ...prev, [aiProvider]: aiApiKey }))
    if ("error" in res && res.error) {
      setMsgAi({ type: "error", text: res.error })
    } else {
      setMsgAi({ type: "success", text: res.success || "Configurações salvas no projeto!" })
    }
    setSavingAi(false)
  }
  const [email, setEmail] = useState(user.email)
  const [senhaAtual, setSenhaAtual] = useState("")
  const [novaSenha, setNovaSenha] = useState("")
  const [confirmSenha, setConfirmSenha] = useState("")
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [msgEmail, setMsgEmail] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [msgPass, setMsgPass] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [muralTexto, setMuralTexto] = useState("")
  const [savingMural, setSavingMural] = useState(false)
  const [msgMural, setMsgMural] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Sincronização Diocesana
  const [diocesanUrl, setDiocesanUrl] = useState("")
  const [diocesanLastSync, setDiocesanLastSync] = useState<string | null>(null)
  const [savingDiocesan, setSavingDiocesan] = useState(false)
  const [syncingDiocesan, setSyncingDiocesan] = useState(false)
  const [msgDiocesan, setMsgDiocesan] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    import("@/actions/mural").then((m) => m.lerMural().then(setMuralTexto))
  }, [])

  useEffect(() => {
    getInfoSincronizacao().then((info) => {
      setDiocesanUrl(info.webhookUrl)
      setDiocesanLastSync(info.lastSync)
    })
  }, [])

  async function handleSalvarMural() {
    setSavingMural(true)
    setMsgMural(null)
    const res = await salvarMural(muralTexto)
    setMsgMural(res.success ? { type: "success", text: res.success } : { type: "error", text: res.error || "Erro" })
    setSavingMural(false)
  }

  async function handleSalvarDiocesanUrl() {
    setSavingDiocesan(true)
    setMsgDiocesan(null)
    const res = await salvarWebhookUrl(diocesanUrl)
    if (res.error) {
      setMsgDiocesan({ type: "error", text: res.error })
    } else {
      setMsgDiocesan({ type: "success", text: res.success || "URL salva!" })
    }
    setSavingDiocesan(false)
  }

  async function handleSincronizar() {
    setSyncingDiocesan(true)
    setMsgDiocesan(null)
    const res = await sincronizarPlanilhaDiocesana()
    if (res.error) {
      setMsgDiocesan({ type: "error", text: res.error })
    } else {
      setMsgDiocesan({ type: "success", text: res.success || "Sincronizado!" })
      const info = await getInfoSincronizacao()
      setDiocesanLastSync(info.lastSync)
    }
    setSyncingDiocesan(false)
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setSavingEmail(true)
    setMsgEmail(null)

    if (email === user.email) {
      setMsgEmail({ type: "error", text: "O e-mail é o mesmo atual." })
      setSavingEmail(false)
      return
    }

    const res = await changeEmail(user.id, email)
    if (res.error) {
      setMsgEmail({ type: "error", text: res.error })
    } else {
      setMsgEmail({ type: "success", text: "E-mail alterado com sucesso!" })
    }
    setSavingEmail(false)
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setSavingPass(true)
    setMsgPass(null)

    if (novaSenha.length < 4) {
      setMsgPass({ type: "error", text: "A senha deve ter pelo menos 4 caracteres." })
      setSavingPass(false)
      return
    }

    if (novaSenha !== confirmSenha) {
      setMsgPass({ type: "error", text: "As senhas não conferem." })
      setSavingPass(false)
      return
    }

    const res = await resetPassword(user.id, novaSenha)
    if (res.error) {
      setMsgPass({ type: "error", text: res.error })
    } else {
      setMsgPass({ type: "success", text: "Senha alterada com sucesso!" })
      setSenhaAtual("")
      setNovaSenha("")
      setConfirmSenha("")
    }
    setSavingPass(false)
  }

  return (
    <>
      <header className="h-16 border-b border-border/40 flex items-center px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Configurações</h1>
      </header>

      <div className="p-4 sm:p-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" /> Alterar E-mail
              </CardTitle>
              <CardDescription>Altere o e-mail de login do administrador.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Novo e-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" disabled={savingEmail}>
                  {savingEmail ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4" /> Salvar E-mail</>}
                </Button>
                {msgEmail && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm flex items-center gap-1 ${msgEmail.type === "success" ? "text-primary" : "text-destructive"}`}
                  >
                    {msgEmail.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {msgEmail.text}
                  </motion.p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4" /> Alterar Senha
              </CardTitle>
              <CardDescription>Altere a senha de acesso ao sistema.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <Input id="novaSenha" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required minLength={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmSenha">Confirmar senha</Label>
                  <Input id="confirmSenha" type="password" value={confirmSenha} onChange={(e) => setConfirmSenha(e.target.value)} required minLength={4} />
                </div>
                <Button type="submit" disabled={savingPass}>
                  {savingPass ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4" /> Salvar Senha</>}
                </Button>
                {msgPass && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-sm flex items-center gap-1 ${msgPass.type === "success" ? "text-primary" : "text-destructive"}`}
                  >
                    {msgPass.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {msgPass.text}
                  </motion.p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" /> Backup do Banco
              </CardTitle>
              <CardDescription>Baixe uma cópia completa do banco de dados.</CardDescription>
            </CardHeader>
            <CardContent>
              <a href="/api/backup" download>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Baixar Backup (.db)
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> Inteligência Artificial
                </CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                  {PROVIDERS_INFO[aiProvider]?.name}
                </span>
              </div>
              <CardDescription>
                Configure os modelos de IA para resumos de encontros, sugestões de conteúdo e quizzes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSalvarAi} className="space-y-4">
                {/* Provedor */}
                <div className="space-y-2">
                  <Label>Provedor de IA</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(["groq", "nvidia", "openrouter", "custom"] as AiProvider[]).map((p) => {
                      const info = PROVIDERS_INFO[p]
                      const isSelected = aiProvider === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleProviderChange(p)}
                          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs font-medium transition-all text-center ${
                            isSelected
                              ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary"
                              : "border-border/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span className="font-semibold text-sm">{info.name}</span>
                          <span className="text-[10px] opacity-80 mt-0.5">{info.badge.split("&")[0]}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                    <span>{PROVIDERS_INFO[aiProvider]?.helpText}</span>
                    {PROVIDERS_INFO[aiProvider]?.helpUrl && (
                      <a
                        href={PROVIDERS_INFO[aiProvider].helpUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                      >
                        Obter chave <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Base URL (se Custom) */}
                {aiProvider === "custom" && (
                  <div className="space-y-2 rounded-lg border border-border/60 p-3 bg-muted/20">
                    <Label htmlFor="customBaseUrl" className="text-xs font-medium flex items-center gap-1.5">
                      Base URL (Endpoint OpenAI-compatible)
                    </Label>
                    <Input
                      id="customBaseUrl"
                      type="url"
                      value={customBaseUrl}
                      onChange={(e) => setCustomBaseUrl(e.target.value)}
                      placeholder="http://localhost:11434/v1 ou https://api.deepseek.com/v1"
                      required={aiProvider === "custom"}
                      className="font-mono text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Compatível com Ollama local, LM Studio, vLLM, DeepSeek direto ou qualquer API no padrão OpenAI.
                    </p>
                  </div>
                )}

                {/* Chave da API */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Chave da API ({PROVIDERS_INFO[aiProvider]?.name})</Label>
                    <span className="text-[11px] text-muted-foreground">
                      💾 Salva por provedor no projeto
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type={showKey ? "text" : "password"}
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      placeholder={PROVIDERS_INFO[aiProvider]?.placeholderKey}
                      required={aiProvider !== "custom"}
                      className="font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                      title={showKey ? "Ocultar chave" : "Mostrar chave"}
                    >
                      {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Modelo</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleListarModelos}
                      disabled={loadingModels}
                      className="h-6 px-2 text-[11px] gap-1 text-primary hover:text-primary"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingModels ? "animate-spin" : ""}`} />
                      {loadingModels ? "Consultando..." : "Listar da API"}
                    </Button>
                  </div>

                  {!isCustomModel ? (
                    <select
                      value={aiModel}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomModel(true)
                          setCustomModelInput(aiModel)
                        } else {
                          setAiModel(e.target.value)
                        }
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      {fetchedModels.length > 0 && (
                        <optgroup label="Modelos carregados da sua API">
                          {fetchedModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))}
                        </optgroup>
                      )}

                      <optgroup label="Modelos recomendados">
                        {MODELOS_SUGERIDOS.filter((m) => m.provider === aiProvider).map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label} {m.tag ? `[${m.tag}]` : ""}
                          </option>
                        ))}
                      </optgroup>

                      <option value="__custom__">✏️ Digitar outro modelo manualmente...</option>
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={customModelInput}
                          onChange={(e) => setCustomModelInput(e.target.value)}
                          placeholder="Digite o ID do modelo (ex: meta/llama-3.3-70b-instruct)"
                          className="text-xs font-mono"
                          required
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsCustomModel(false)
                            if (customModelInput.trim()) {
                              setAiModel(customModelInput.trim())
                            }
                          }}
                        >
                          Voltar à lista
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Insira o identificador exato aceito pelo endpoint do provedor.
                      </p>
                    </div>
                  )}
                </div>

                {/* Feedback de Teste */}
                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-2.5 rounded-md text-xs flex items-start gap-2 border ${
                      testResult.success
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "bg-destructive/10 border-destructive/30 text-destructive"
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-tight">{testResult.text}</span>
                  </motion.div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="submit"
                    disabled={savingAi}
                    size="sm"
                    className="gap-1.5"
                  >
                    {savingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {savingAi ? "Salvando..." : "Salvar no Projeto"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={testingAi}
                    size="sm"
                    onClick={handleTestarConexao}
                    className="gap-1.5"
                  >
                    {testingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                    {testingAi ? "Testando..." : "Testar Conexão"}
                  </Button>
                </div>

                {/* Mensagens gerais */}
                {msgAi && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs flex items-center gap-1.5 pt-1 ${
                      msgAi.type === "success" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {msgAi.type === "success" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {msgAi.text}
                  </motion.p>
                )}
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" /> Mural de Avisos
              </CardTitle>
              <CardDescription>Escreva um aviso que aparecerá na página dos catequistas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={muralTexto}
                onChange={(e) => setMuralTexto(e.target.value)}
                placeholder="Digite o aviso para os catequistas..."
                rows={4}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
              <div className="flex items-center gap-3">
                <Button type="button" size="sm" className="gap-2" onClick={handleSalvarMural} disabled={savingMural}>
                  {savingMural ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingMural ? "Salvando..." : "Salvar Aviso"}
                </Button>
                {msgMural && (
                  <span className={`text-xs flex items-center gap-1 ${msgMural.type === "success" ? "text-primary" : "text-destructive"}`}>
                    {msgMural.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                    {msgMural.text}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Os catequistas veem esse aviso na página pública de histórico.</p>
            </CardContent>
          </Card>

          {/* Sincronização Diocesana */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" /> Sincronização Diocesana
              </CardTitle>
              <CardDescription>
                Envie os dados de presença para a planilha da Escola Diocesana de Santo André.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diocesanUrl">URL do Webhook</Label>
                <div className="flex gap-2">
                  <Input
                    id="diocesanUrl"
                    type="url"
                    value={diocesanUrl}
                    onChange={(e) => setDiocesanUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="gap-2 shrink-0"
                    onClick={handleSalvarDiocesanUrl}
                    disabled={savingDiocesan || !diocesanUrl.trim()}
                  >
                    {savingDiocesan ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                    ) : (
                      <><Save className="h-4 w-4" /> Salvar</>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  className="gap-2"
                  onClick={handleSincronizar}
                  disabled={syncingDiocesan || !diocesanUrl.trim()}
                >
                  {syncingDiocesan ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sincronizando...</>
                  ) : (
                    <><RotateCcw className="h-4 w-4" /> Sincronizar Agora</>
                  )}
                </Button>

                {diocesanLastSync && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Última sincronização: {new Date(diocesanLastSync).toLocaleString("pt-BR")}
                  </span>
                )}
              </div>

              {!diocesanUrl.trim() && (
                <p className="text-xs text-muted-foreground">
                  Configure a URL do webhook para ativar a sincronização.
                </p>
              )}

              {msgDiocesan && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm flex items-center gap-1 ${msgDiocesan.type === "success" ? "text-primary" : "text-destructive"}`}
                >
                  {msgDiocesan.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  {msgDiocesan.text}
                </motion.p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notificações Push
              </CardTitle>
              <CardDescription>Receba notificações no celular quando catequistas confirmarem presença.</CardDescription>
            </CardHeader>
            <CardContent>
              <PushManager />
            </CardContent>
          </Card>

          <BackupCard />
        </div>
      </div>
    </>
  )
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function BackupCard() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)
  const [criando, setCriando] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [restaurando, setRestaurando] = useState<string | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null)

  async function carregar() {
    setLoading(true)
    try {
      const res = await fetch("/api/backups")
      const data = await res.json()
      setBackups(data.backups ?? [])
    } catch { setBackups([]) }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  async function criarBackup() {
    setCriando(true)
    setMsg(null)
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        body: JSON.stringify({ action: "criar" }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: "success", text: data.success })
        carregar()
      } else {
        setMsg({ type: "error", text: data.error })
      }
    } catch { setMsg({ type: "error", text: "Erro ao criar backup." }) }
    setCriando(false)
  }

  async function restaurar(nome: string) {
    setRestaurando(nome)
    setMsg(null)
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        body: JSON.stringify({ action: "restaurar", name: nome }),
      })
      const data = await res.json()
      if (data.success) {
        setMsg({ type: "success", text: data.success })
      } else {
        setMsg({ type: "error", text: data.error })
      }
    } catch { setMsg({ type: "error", text: "Erro ao restaurar backup." }) }
    setRestaurando(null)
    setConfirmRestore(null)
  }

  async function excluir(nome: string) {
    setMsg(null)
    try {
      const res = await fetch("/api/backups", {
        method: "POST",
        body: JSON.stringify({ action: "excluir", name: nome }),
      })
      const data = await res.json()
      if (data.success) {
        carregar()
      } else {
        setMsg({ type: "error", text: data.error })
      }
    } catch { setMsg({ type: "error", text: "Erro ao excluir backup." }) }
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <HardDrive className="h-4 w-4" /> Gerenciar Backups
        </CardTitle>
        <CardDescription>Backups automáticos diários. Você também pode criar ou restaurar manualmente.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={criarBackup} disabled={criando} size="sm" className="gap-2">
            {criando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {criando ? "Criando..." : "Criar Backup Agora"}
          </Button>
          <Button onClick={carregar} disabled={loading} variant="outline" size="sm" className="gap-2">
            <RotateCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Carregando backups...</p>
        ) : backups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nenhum backup encontrado.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 px-2 font-medium text-muted-foreground">Data</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Tamanho</th>
                  <th className="text-right py-2 px-2 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {backups.map((b) => (
                    <motion.tr
                      key={b.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border/20 hover:bg-muted/30"
                    >
                      <td className="py-2 px-2 whitespace-nowrap">
                        {new Date(b.date).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 px-2 text-right text-muted-foreground whitespace-nowrap">
                        {formatSize(b.size)}
                      </td>
                      <td className="py-2 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <a href={`/api/backups/${encodeURIComponent(b.name)}`} download>
                            <button className="p-1.5 rounded hover:bg-muted transition-colors" title="Baixar">
                              <Download className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </a>
                          {confirmRestore === b.name ? (
                            <>
                              <button
                                onClick={() => restaurar(b.name)}
                                disabled={restaurando === b.name}
                                className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs font-medium"
                              >
                                {restaurando === b.name ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => setConfirmRestore(null)}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-xs"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setConfirmRestore(b.name)}
                              className="p-1.5 rounded hover:bg-amber-500/10 transition-colors"
                              title="Restaurar"
                            >
                              <RotateCcw className="h-4 w-4 text-amber-500" />
                            </button>
                          )}
                          <button
                            onClick={() => excluir(b.name)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}

        {msg && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-sm flex items-center gap-1 ${msg.type === "success" ? "text-primary" : "text-destructive"}`}
          >
            {msg.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {msg.text}
          </motion.p>
        )}
      </CardContent>
    </Card>
  )
}
