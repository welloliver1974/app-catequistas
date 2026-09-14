"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Search,
  X,
  ArrowLeft,
  Users,
  CalendarDays,
  Sparkles,
  Check,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sincronizarChamadaLote, EstadoPresenca } from "@/actions/presencas"

interface EncontroItem {
  id: string
  tema: string
  data: string
  numeroEncontro: number | null
}

interface CatequistaChamada {
  id: string
  nome: string
  telefone: string | null
  estado: EstadoPresenca
}

interface Props {
  encontro: {
    id: string
    tema: string
    data: string
    local: string
    turma: string
    numeroEncontro: number | null
  } | null
  encontros: EncontroItem[]
  catequistasIniciais: CatequistaChamada[]
}

function getLetraInicial(nome: string): string {
  const char = nome.trim().charAt(0).toUpperCase()
  return char.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function formatDataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR")
}

export function ChamadaOfflineClient({ encontro, encontros, catequistasIniciais }: Props) {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [lista, setLista] = useState<CatequistaChamada[]>(catequistasIniciais)
  const [pendenteSincronizacao, setPendenteSincronizacao] = useState(false)
  const [sincronizando, setSincronizando] = useState(false)
  const [msgSucesso, setMsgSucesso] = useState<string | null>(null)
  const [msgErro, setMsgErro] = useState<string | null>(null)

  // Filtros
  const [letraAtiva, setLetraAtiva] = useState<string>("")
  const [termoBusca, setTermoBusca] = useState<string>("")
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "pendentes" | "presentes" | "ausentes">("todos")

  const storageKey = encontro ? `chamada_offline_${encontro.id}` : null

  // Monitora status da conexão online/offline
  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Carrega estado do localStorage para este encontro
  useEffect(() => {
    if (!storageKey) return
    try {
      const salvo = localStorage.getItem(storageKey)
      if (salvo) {
        const dadosLocais: Record<string, EstadoPresenca> = JSON.parse(salvo)
        setLista((prev) =>
          prev.map((c) => ({
            ...c,
            estado: dadosLocais[c.id] !== undefined ? dadosLocais[c.id] : c.estado,
          }))
        )
        setPendenteSincronizacao(true)
      } else {
        setLista(catequistasIniciais)
        setPendenteSincronizacao(false)
      }
    } catch {
      setLista(catequistasIniciais)
    }
  }, [storageKey, catequistasIniciais])

  // Salva no localStorage a cada alteração
  function atualizarEstadoCatequista(id: string, novoEstado: EstadoPresenca) {
    setLista((prev) => {
      const atualizada = prev.map((c) => (c.id === id ? { ...c, estado: novoEstado } : c))
      if (storageKey) {
        try {
          const mapaParaSalvar: Record<string, EstadoPresenca> = {}
          atualizada.forEach((c) => {
            mapaParaSalvar[c.id] = c.estado
          })
          localStorage.setItem(storageKey, JSON.stringify(mapaParaSalvar))
          setPendenteSincronizacao(true)
        } catch {
          // localStorage indisponível
        }
      }
      return atualizada
    })
  }

  // Sincronização em lote com o servidor
  async function handleSincronizar() {
    if (!encontro) return
    setSincronizando(true)
    setMsgErro(null)
    setMsgSucesso(null)

    const payload = lista.map((c) => ({
      catequistaId: c.id,
      estado: c.estado,
    }))

    const res = await sincronizarChamadaLote(encontro.id, payload)
    if (res.error) {
      setMsgErro(res.error)
    } else {
      setMsgSucesso(`Chamada sincronizada com sucesso! (${res.salvos ?? lista.length} registros salvos)`)
      setPendenteSincronizacao(false)
      if (storageKey) {
        try {
          localStorage.removeItem(storageKey)
        } catch {
          // ignora
        }
      }
    }
    setSincronizando(false)
  }

  // Letras disponíveis
  const letrasDisponiveis = useMemo(() => {
    const s = new Set<string>()
    lista.forEach((c) => {
      const letra = getLetraInicial(c.nome)
      if (letra && /[A-Z]/.test(letra)) s.add(letra)
    })
    return Array.from(s).sort()
  }, [lista])

  // Lista filtrada
  const filtrados = useMemo(() => {
    return lista.filter((c) => {
      if (letraAtiva && getLetraInicial(c.nome) !== letraAtiva) return false
      if (filtroEstado !== "todos") {
        if (filtroEstado === "pendentes" && c.estado !== "pendente") return false
        if (filtroEstado === "presentes" && c.estado !== "presente") return false
        if (filtroEstado === "ausentes" && c.estado !== "ausente") return false
      }
      if (termoBusca.trim()) {
        const buscaNorm = termoBusca.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        const nomeNorm = c.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        if (!nomeNorm.includes(buscaNorm)) return false
      }
      return true
    })
  }, [lista, letraAtiva, filtroEstado, termoBusca])

  // Contadores
  const stats = useMemo(() => {
    const total = lista.length
    const presentes = lista.filter((c) => c.estado === "presente").length
    const ausentes = lista.filter((c) => c.estado === "ausente").length
    const pendentes = total - presentes - ausentes
    const progresso = total > 0 ? Math.round(((presentes + ausentes) / total) * 100) : 0
    return { total, presentes, ausentes, pendentes, progresso }
  }, [lista])

  function handleSelecionarEncontro(value: string) {
    router.replace(`/presenca/chamada?encontro=${value}`)
  }

  if (!encontro) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4">
        <Card className="text-center p-8">
          <p className="text-muted-foreground">Nenhum encontro agendado para chamada.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4 pb-24">
      {/* Top Bar / Navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Link href="/presenca" className="p-2 rounded-lg border border-border/50 hover:bg-muted text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span>Chamada Offline</span>
              {isOnline ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <Wifi className="h-3 w-3" /> Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full animate-pulse">
                  <WifiOff className="h-3 w-3" /> Offline (Salvo local)
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              Faça a chamada mesmo sem sinal de internet. Os dados ficam seguros no seu aparelho.
            </p>
          </div>
        </div>

        {/* Seletor de Encontro */}
        <div className="w-full sm:w-64">
          <Select value={encontro.id} onValueChange={handleSelecionarEncontro}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Selecione o encontro" />
            </SelectTrigger>
            <SelectContent>
              {encontros.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.numeroEncontro ? `Encontro ${e.numeroEncontro}` : formatDataCurta(e.data)} — {e.tema}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Banner de Sincronização / Status */}
      <Card className={`border ${pendenteSincronizacao ? "border-amber-500/30 bg-amber-500/5" : "border-border/40 bg-card/50"}`}>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              pendenteSincronizacao ? "bg-amber-500/20 text-amber-500" : "bg-emerald-500/20 text-emerald-500"
            }`}>
              {pendenteSincronizacao ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {pendenteSincronizacao
                  ? "Alterações salvas localmente no aparelho"
                  : "Todos os registros estão sincronizados"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isOnline
                  ? pendenteSincronizacao
                    ? "Você está online. Clique para gravar em definitivo no servidor."
                    : "Servidor SQLite atualizado."
                  : "Modo offline: continue marcando à vontade. Os dados não serão perdidos."}
              </p>
            </div>
          </div>

          <Button
            onClick={handleSincronizar}
            disabled={sincronizando || !isOnline || !pendenteSincronizacao}
            className="w-full sm:w-auto h-9 text-xs font-semibold gap-2 shrink-0"
          >
            <RotateCw className={`h-3.5 w-3.5 ${sincronizando ? "animate-spin" : ""}`} />
            {sincronizando ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>
        </CardContent>
      </Card>

      {/* Feedbacks */}
      {msgSucesso && (
        <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-xl flex items-center justify-between">
          <span>{msgSucesso}</span>
          <button onClick={() => setMsgSucesso(null)}><X className="h-4 w-4" /></button>
        </div>
      )}
      {msgErro && (
        <div className="p-3 text-xs bg-destructive/10 border border-destructive/30 text-destructive rounded-xl flex items-center justify-between">
          <span>{msgErro}</span>
          <button onClick={() => setMsgErro(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Estatísticas e Progresso */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-3 rounded-xl border border-border/40 bg-card/60">
          <span className="text-xs text-muted-foreground">Total Catequistas</span>
          <p className="text-xl font-bold">{stats.total}</p>
        </div>
        <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Presentes
          </span>
          <p className="text-xl font-bold text-emerald-500">{stats.presentes}</p>
        </div>
        <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <span className="text-xs text-rose-500 font-medium flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Ausentes
          </span>
          <p className="text-xl font-bold text-rose-500">{stats.ausentes}</p>
        </div>
        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-xs text-amber-500 font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pendentes
          </span>
          <p className="text-xl font-bold text-amber-500">{stats.pendentes}</p>
        </div>
      </div>

      {/* Barra de Progresso da Chamada */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso da Chamada: {stats.presentes + stats.ausentes} de {stats.total}</span>
          <span className="font-semibold text-foreground">{stats.progresso}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${stats.progresso}%` }}
          />
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Busca Textual */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar catequista..."
              className="pl-8 pr-8 h-9 text-xs"
            />
            {termoBusca && (
              <button
                type="button"
                onClick={() => setTermoBusca("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtro de Estado */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {(["todos", "pendentes", "presentes", "ausentes"] as const).map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setFiltroEstado(estado)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                  filtroEstado === estado
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted/70 text-muted-foreground hover:text-foreground"
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        {/* Barra de Letras Iniciais (A-Z) */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <button
            type="button"
            onClick={() => setLetraAtiva("")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
              letraAtiva === ""
                ? "bg-primary text-primary-foreground font-semibold"
                : "bg-muted/70 text-muted-foreground hover:text-foreground"
            }`}
          >
            Todas
          </button>
          {letrasDisponiveis.map((letra) => (
            <button
              type="button"
              key={letra}
              onClick={() => setLetraAtiva(letraAtiva === letra ? "" : letra)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                letraAtiva === letra
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {letra}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Catequistas para Chamada Rápida */}
      <div className="space-y-2">
        {filtrados.length === 0 ? (
          <Card className="text-center p-8 border-border/40">
            <p className="text-xs text-muted-foreground">Nenhum catequista encontrado com os filtros selecionados.</p>
          </Card>
        ) : (
          filtrados.map((c) => (
            <div
              key={c.id}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                c.estado === "presente"
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : c.estado === "ausente"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : "border-border/50 bg-card/60"
              }`}
            >
              {/* Identificação */}
              <div className="min-w-0 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  c.estado === "presente"
                    ? "bg-emerald-500/20 text-emerald-500"
                    : c.estado === "ausente"
                    ? "bg-rose-500/20 text-rose-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {c.nome.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate leading-tight">{c.nome}</p>
                  {c.telefone && <p className="text-[11px] text-muted-foreground">{c.telefone}</p>}
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => atualizarEstadoCatequista(c.id, "presente")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    c.estado === "presente"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-muted/80 text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-500"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Presente
                </button>

                <button
                  type="button"
                  onClick={() => atualizarEstadoCatequista(c.id, "ausente")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    c.estado === "ausente"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-muted/80 text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500"
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Ausente
                </button>

                {c.estado !== "pendente" && (
                  <button
                    type="button"
                    onClick={() => atualizarEstadoCatequista(c.id, "pendente")}
                    title="Limpar e marcar como Pendente"
                    className="p-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
