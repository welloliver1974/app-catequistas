import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retorna meia-noite de hoje no horário de Brasília (UTC-3), expresso em UTC.
 *
 * Por que usar isso em vez de `new Date()`?
 * Encontros são salvos ao meio-dia UTC (T12:00:00Z). A partir das 21h de
 * Brasília (= 00:00 UTC do dia seguinte), `new Date()` já está "no dia
 * seguinte" em UTC — fazendo o encontro de hoje parecer "passado" antes de
 * a meia-noite brasileira chegar. Usando o início do dia brasileiro como
 * referência, o encontro permanece visível durante todo o dia local,
 * permitindo que catequistas registrem presença até as 23h59.
 *
 * Exemplo: hoje é 16/06 às 22:30 em Brasília
 *  → new Date()              = 2026-06-17T01:30:00Z  (dia 17 em UTC!) ❌
 *  → inicioDoDiaBrasilia()   = 2026-06-16T03:00:00Z  (00:00 Brasília) ✅
 */
export function inicioDoDiaBrasilia(): Date {
  const OFFSET_BRASILIA_MS = 3 * 60 * 60 * 1000 // UTC-3

  // Hora atual convertida para o "clock" de Brasília
  const agora = new Date()
  const agoraBrasilia = new Date(agora.getTime() - OFFSET_BRASILIA_MS)

  // Zera horas/minutos/segundos para pegar só a data
  const ano = agoraBrasilia.getUTCFullYear()
  const mes = agoraBrasilia.getUTCMonth()
  const dia = agoraBrasilia.getUTCDate()

  // Meia-noite de Brasília = 03:00 UTC
  return new Date(Date.UTC(ano, mes, dia, 3, 0, 0, 0))
}
