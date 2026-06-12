import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { createHash } from "node:crypto"

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

import "dotenv/config"

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Limpando dados existentes...")
  await prisma.registroPresenca.deleteMany()
  await prisma.encontro.deleteMany()
  await prisma.turmaCatequista.deleteMany()
  await prisma.catequista.deleteMany()
  await prisma.turma.deleteMany()
  await prisma.user.deleteMany()

  console.log("Criando usuário admin...")
  const admin = await prisma.user.create({
    data: {
      email: "admin@catequese.com",
      name: "Administrador",
      password: hashPassword("admin123"),
      role: "ADMIN",
    },
  })
  const turma1 = await prisma.turma.create({
    data: { nome: "Crisma", descricao: "Turma de Crisma 2026" },
  })
  const turma2 = await prisma.turma.create({
    data: { nome: "Eucaristia", descricao: "Primeira Eucaristia 2026" },
  })

  console.log("Criando catequistas...")
  const catequistasData = [
    { nome: "Ana Maria Silva", email: "ana@email.com", telefone: "(11) 99999-0001" },
    { nome: "Carlos Oliveira", email: "carlos@email.com", telefone: "(11) 99999-0002" },
    { nome: "Beatriz Santos", email: "beatriz@email.com", telefone: "(11) 99999-0003" },
    { nome: "Daniel Souza", email: "daniel@email.com", telefone: "(11) 99999-0004" },
    { nome: "Elaine Costa", email: "elaine@email.com", telefone: "(11) 99999-0005" },
    { nome: "Fernando Lima", email: "fernando@email.com", telefone: "(11) 99999-0006" },
    { nome: "Gabriela Alves", email: "gabriela@email.com", telefone: "(11) 99999-0007" },
    { nome: "Hugo Pereira", email: "hugo@email.com", telefone: "(11) 99999-0008" },
    { nome: "Isabela Martins", email: "isabela@email.com", telefone: "(11) 99999-0009" },
    { nome: "João Pedro Rocha", email: "joao@email.com", telefone: "(11) 99999-0010" },
    { nome: "Karina Dias", email: "karina@email.com", telefone: "(11) 99999-0011" },
    { nome: "Lucas Mendes", email: "lucas@email.com", telefone: "(11) 99999-0012" },
  ]

  const catequistas = await Promise.all(
    catequistasData.map((c) =>
      prisma.catequista.create({
        data: {
          ...c,
          dataEntrada: new Date("2026-02-01"),
          turmas: {
            create: [
              {
                turmaId: Math.random() > 0.5 ? turma1.id : turma2.id,
              },
            ],
          },
        },
      })
    )
  )

  console.log("Vinculando admin ao primeiro catequista...")
  await prisma.catequista.update({
    where: { id: catequistas[0].id },
    data: { userId: admin.id },
  })

  console.log("Criando encontros...")
  const primeiroDomingo = new Date("2026-05-03")
  const encontrosData = Array.from({ length: 5 }, (_, i) => {
    const data = new Date(primeiroDomingo)
    data.setDate(data.getDate() + i * 7)
    return data
  })

  const encontros = await Promise.all(
    encontrosData.map((data, i) =>
      prisma.encontro.create({
        data: {
          turmaId: turma1.id,
          data,
          tema: `Encontro ${i + 3}`,
          local: "Paróquia São José Operário",
          linkPdf:
            i === 0
              ? "https://drive.google.com/file/d/1_wI0LXtcgpK4-vFiqjwYb9h_mLYtdixM/view"
              : null,
        },
      })
    )
  )

  console.log("Criando registros de presença...")
  for (const encontro of encontros) {
    for (let j = 0; j < catequistas.length; j++) {
      const presente = Math.random() > 0.2
      await prisma.registroPresenca.create({
        data: {
          encontroId: encontro.id,
          catequistaId: catequistas[j].id,
          presente,
          justificativa: presente ? null : "Não pude comparecer",
          confirmadoEm: new Date(encontro.data.getTime() + 3600000),
        },
      })
    }
  }

  console.log("\n✅ Seed concluído!")
  console.log("   Admin: admin@catequese.com / admin123")
  console.log(`   ${catequistas.length} catequistas criados`)
  console.log(`   ${encontros.length} encontros criados`)
  console.log(`   ${encontros.length * catequistas.length} presenças registradas`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
