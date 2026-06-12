import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const rotasProtegidas = ["/dashboard", "/encontros", "/catequistas", "/turmas", "/calendario", "/notificacoes", "/importar", "/relatorios"]
const rotasPublicas = ["/login", "/presenca/confirmar", "/presenca/"]

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (rotasPublicas.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  if (rotasProtegidas.some((r) => pathname.startsWith(r))) {
    const session = req.cookies.get("session")?.value
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
}
