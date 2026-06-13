"use server"

import { createHash } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, password: true, role: true },
  })

  if (!user || user.password !== hashPassword(password)) {
    return { error: "E-mail ou senha inválidos" }
  }

  const cookieStore = await cookies()
  cookieStore.set("session", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  redirect("/dashboard")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login")
}

export async function resetPassword(userId: string, newPassword: string) {
  if (newPassword.length < 4) {
    return { error: "A senha deve ter pelo menos 4 caracteres." }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashPassword(newPassword) },
  })

  return { success: true }
}

export async function changeEmail(userId: string, newEmail: string) {
  const existing = await prisma.user.findUnique({ where: { email: newEmail } })
  if (existing) {
    return { error: "Este e-mail já está em uso." }
  }
  await prisma.user.update({
    where: { id: userId },
    data: { email: newEmail },
  })
  return { success: true }
}

export async function getUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("session")?.value
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  })
  return user
}
