import { listarCatequistasAtivos, lerMuralPublico } from "@/actions/catequista-publico"
import { HistoricoClient } from "./client"

export const dynamic = "force-dynamic"

export default async function HistoricoPage() {
  const [catequistas, mural] = await Promise.all([
    listarCatequistasAtivos(),
    lerMuralPublico(),
  ])

  return <HistoricoClient catequistas={catequistas} muralInicial={mural} />
}
