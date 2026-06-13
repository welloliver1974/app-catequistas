import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rotasProtegidas = ["/dashboard", "/encontros", "/catequistas", "/turmas", "/calendario", "/notificacoes", "/importar", "/relatorios", "/configuracoes", "/presenca"]
const rotasPublicas = ["/login", "/recuperar-senha", "/presenca/confirmar"]

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (rotasPublicas.some((r) => pathname.startsWith(r))) {
    const res = NextResponse.next()
    res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
    return res
  }

  if (rotasProtegidas.some((r) => pathname.startsWith(r))) {
    const session = req.cookies.get("session")?.value
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
  }

  const res = NextResponse.next()
  res.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
}
