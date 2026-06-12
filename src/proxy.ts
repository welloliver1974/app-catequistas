import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/encontros", "/catequistas", "/turmas", "/presenca", "/calendario", "/notificacoes", "/importar", "/relatorios"]

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route))

  const session = req.cookies.get("session")?.value

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$|.*\\.ico$).*)"],
}
