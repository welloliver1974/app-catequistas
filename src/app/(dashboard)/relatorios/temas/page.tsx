import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { TemasRecorrentesClient } from "./client"

export const dynamic = "force-dynamic"

export default async function TemasRecorrentesPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session")?.value
  if (!userId) redirect("/login")

  return <TemasRecorrentesClient />
}
