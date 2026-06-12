import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { DashboardLayoutClient } from "./layout-client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session")?.value

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, role: true },
      })
    : null

  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
}
