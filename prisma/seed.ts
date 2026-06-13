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
      email: "welloliver@gmail.com",
      name: "Administrador",
      password: hashPassword("admin123"),
      role: "ADMIN",
    },
  })

  const turma1 = await prisma.turma.create({
    data: { nome: "Forania Santo Andre Centro" },
  })

  console.log("Criando catequistas...")
  const catequistasData = [
    { nome: "Alessandra Fonseca", email: "alessandra.fonseca@catequese.com", telefone: "" },
    { nome: "Alessandro Batista", email: "alessandro.batista@catequese.com", telefone: "" },
    { nome: "Alexia Almeida Amorim", email: "alexia.almeida.amorim@catequese.com", telefone: "" },
    { nome: "Aline Baldon Bertoldo", email: "aline.baldon.bertoldo@catequese.com", telefone: "" },
    { nome: "Allan", email: "allan@catequese.com", telefone: "" },
    { nome: "Ana Beathriz Paz do Valle", email: "ana.beathriz.paz.do.valle@catequese.com", telefone: "" },
    { nome: "Ana Paula Rodrigues", email: "ana.paula.rodrigues@catequese.com", telefone: "" },
    { nome: "Anderson Cordeiro", email: "anderson.cordeiro@catequese.com", telefone: "" },
    { nome: "Anderson Seguedin", email: "anderson.seguedin@catequese.com", telefone: "" },
    { nome: "André Cezaretto", email: "andre.cezaretto@catequese.com", telefone: "" },
    { nome: "Angela Costa", email: "angela.costa@catequese.com", telefone: "" },
    { nome: "Angela Cristina Camillo", email: "angela.cristina.camillo@catequese.com", telefone: "" },
    { nome: "Antonia Rodrigues Sarapião", email: "antonia.rodrigues.sarapiao@catequese.com", telefone: "" },
    { nome: "Antonio Millanez Neto", email: "antonio.millanez.neto@catequese.com", telefone: "" },
    { nome: "Bianca de Melo de Castro", email: "bianca.de.melo.de.castro@catequese.com", telefone: "" },
    { nome: "Clarice Ivo Mantuan", email: "clarice.ivo.mantuan@catequese.com", telefone: "" },
    { nome: "Claudia C C Camargo", email: "claudia.c.c.camargo@catequese.com", telefone: "" },
    { nome: "Cristiane M. Santana", email: "cristiane.m.santana@catequese.com", telefone: "" },
    { nome: "Cristina Cardoso Lopes", email: "cristina.cardoso.lopes@catequese.com", telefone: "" },
    { nome: "Daihane Vanessa Nava de Oliveira", email: "daihane.vanessa.nava.de.oliveira@catequese.com", telefone: "" },
    { nome: "Danielle Cristiane Limonge Schwab", email: "danielle.cristiane.limonge.schwab@catequese.com", telefone: "" },
    { nome: "Eder Fagundes", email: "eder.fagundes@catequese.com", telefone: "" },
    { nome: "Elaine Cristina Jacopucci", email: "elaine.cristina.jacopucci@catequese.com", telefone: "" },
    { nome: "Elcon Otero", email: "elcon.otero@catequese.com", telefone: "" },
    { nome: "Eliane Ap. Silva do Carmo", email: "eliane.ap.silva.do.carmo@catequese.com", telefone: "" },
    { nome: "Fabio Nepomuceno Gama", email: "fabio.nepomuceno.gama@catequese.com", telefone: "" },
    { nome: "Fernanda Thaynnan Rodrigues Santos", email: "fernanda.thaynnan.rodrigues.santos@catequese.com", telefone: "" },
    { nome: "Flavia Cristina de Almeida Souza", email: "flavia.cristina.de.almeida.souza@catequese.com", telefone: "" },
    { nome: "Geraldo Bontempi Soromenho", email: "geraldo.bontempi.soromenho@catequese.com", telefone: "" },
    { nome: "Gilberto J. do Carmo", email: "gilberto.j.do.carmo@catequese.com", telefone: "" },
    { nome: "Guilerme D. Alencar", email: "guilerme.d.alencar@catequese.com", telefone: "" },
    { nome: "Henrique Meza", email: "henrique.meza@catequese.com", telefone: "" },
    { nome: "Hevaldo Santos Gonçalves", email: "hevaldo.santos.goncalves@catequese.com", telefone: "" },
    { nome: "Ilzete", email: "ilzete@catequese.com", telefone: "" },
    { nome: "Jaqueline Ribeiro de Melo Oliveira", email: "jaqueline.ribeiro.de.melo.oliveira@catequese.com", telefone: "" },
    { nome: "Jeferson de Oliveira", email: "jeferson.de.oliveira@catequese.com", telefone: "" },
    { nome: "Josimar Carlos de Oliveira", email: "josimar.carlos.de.oliveira@catequese.com", telefone: "" },
    { nome: "Julia da Piedade", email: "julia.da.piedade@catequese.com", telefone: "" },
    { nome: "Juliana Colucci Spalato", email: "juliana.colucci.spalato@catequese.com", telefone: "" },
    { nome: "Juliana Dias", email: "juliana.dias@catequese.com", telefone: "" },
    { nome: "Juliana Ludmila Orlandi Paschoalin", email: "juliana.ludmila.orlandi.paschoalin@catequese.com", telefone: "" },
    { nome: "Juliana Souza Presotto", email: "juliana.souza.presotto@catequese.com", telefone: "" },
    { nome: "Keila Guarizo", email: "keila.guarizo@catequese.com", telefone: "" },
    { nome: "Kelly Guariento", email: "kelly.guariento@catequese.com", telefone: "" },
    { nome: "Lais Rossato Amaral", email: "lais.rossato.amaral@catequese.com", telefone: "" },
    { nome: "Lara Vianni Andrezza Galhego", email: "lara.vianni.andrezza.galhego@catequese.com", telefone: "" },
    { nome: "Larissa Tozim", email: "larissa.tozim@catequese.com", telefone: "" },
    { nome: "Levi Vinicius Leite de Sousa", email: "levi.vinicius.leite.de.sousa@catequese.com", telefone: "" },
    { nome: "Luiza Rodrigues dos Santos Souza", email: "luiza.rodrigues.dos.santos.souza@catequese.com", telefone: "" },
    { nome: "Marcio José Rubortone", email: "marcio.jose.rubortone@catequese.com", telefone: "" },
    { nome: "Maria Clara Orlandi Paschoalin", email: "maria.clara.orlandi.paschoalin@catequese.com", telefone: "" },
    { nome: "Maria Eduarda Brilhante Torres", email: "maria.eduarda.brilhante.torres@catequese.com", telefone: "" },
    { nome: "Maria Flávia de Oliveira", email: "maria.flavia.de.oliveira@catequese.com", telefone: "" },
    { nome: "Maria Landi", email: "maria.landi@catequese.com", telefone: "" },
    { nome: "Mariana Masquetti Leite", email: "mariana.masquetti.leite@catequese.com", telefone: "" },
    { nome: "Mariangela Martins Setin", email: "mariangela.martins.setin@catequese.com", telefone: "" },
    { nome: "Mateus Afonso de Melo Capellari", email: "mateus.afonso.de.melo.capellari@catequese.com", telefone: "" },
    { nome: "Matheus de Oliveira Pamplona", email: "matheus.de.oliveira.pamplona@catequese.com", telefone: "" },
    { nome: "Matheus Quirino da Silva", email: "matheus.quirino.da.silva@catequese.com", telefone: "" },
    { nome: "Milene Matos Rodrigues Cruz", email: "milene.matos.rodrigues.cruz@catequese.com", telefone: "" },
    { nome: "Miriam Seguedin", email: "miriam.seguedin@catequese.com", telefone: "" },
    { nome: "Neulisângela da Silva Mariano Fritola", email: "neulisangela.da.silva.mariano.fritola@catequese.com", telefone: "" },
    { nome: "Nilceia Jaqueline Rangel", email: "nilceia.jaqueline.rangel@catequese.com", telefone: "" },
    { nome: "Niluzia Donizete da Silva Soromenho", email: "niluzia.donizete.da.silva.soromenho@catequese.com", telefone: "" },
    { nome: "Olavo Fro Mangnan", email: "olavo.fro.mangnan@catequese.com", telefone: "" },
    { nome: "Pamela Galvão Gorizan Cardoso", email: "pamela.galvao.gorizan.cardoso@catequese.com", telefone: "" },
    { nome: "Paola da Silva Oliveira", email: "paola.da.silva.oliveira@catequese.com", telefone: "" },
    { nome: "Paulo Cesar Fritola", email: "paulo.cesar.fritola@catequese.com", telefone: "" },
    { nome: "Renata Batista Moreira", email: "renata.batista.moreira@catequese.com", telefone: "" },
    { nome: "Rendes Ferreira S. Torin", email: "rendes.ferreira.s.torin@catequese.com", telefone: "" },
    { nome: "Renilda Teixeira Pereira", email: "renilda.teixeira.pereira@catequese.com", telefone: "" },
    { nome: "Ronilton Dantas de Oliveira", email: "ronilton.dantas.de.oliveira@catequese.com", telefone: "" },
    { nome: "Rosa Maria Mengel Justo", email: "rosa.maria.mengel.justo@catequese.com", telefone: "" },
    { nome: "Salete Auxiliadora Gulmini", email: "salete.auxiliadora.gulmini@catequese.com", telefone: "" },
    { nome: "Sandra Aparecida Saltini de Moraes", email: "sandra.aparecida.saltini.de.moraes@catequese.com", telefone: "" },
    { nome: "Sara Millanez", email: "sara.millanez@catequese.com", telefone: "" },
    { nome: "Solange Aparecida Pereira Prioli", email: "solange.aparecida.pereira.prioli@catequese.com", telefone: "" },
    { nome: "Susilei Freitas Gama de Godoi", email: "susilei.freitas.gama.de.godoi@catequese.com", telefone: "" },
    { nome: "Tais Crivellari Rubortone", email: "tais.crivellari.rubortone@catequese.com", telefone: "" },
    { nome: "Tatiana Carrieri Agra", email: "tatiana.carrieri.agra@catequese.com", telefone: "" },
    { nome: "Thaís Monteiro Varga Libanori", email: "thais.monteiro.varga.libanori@catequese.com", telefone: "" },
    { nome: "Thais Talarico", email: "thais.talarico@catequese.com", telefone: "" },
    { nome: "Thiago Emanuel Cardoso Souza", email: "thiago.emanuel.cardoso.souza@catequese.com", telefone: "" },
    { nome: "Vivian Aparecida Moralez Guimarães", email: "vivian.aparecida.moralez.guimaraes@catequese.com", telefone: "" },
    { nome: "Wellington Ferreira de Moraes", email: "wellington.ferreira.de.moraes@catequese.com", telefone: "" },
  ]

  const catequistas = await Promise.all(
    catequistasData.map((c) =>
      prisma.catequista.create({
        data: {
          nome: c.nome,
          email: c.email,
          telefone: c.telefone,
          dataEntrada: new Date("2026-06-13"),
          turmas: {
            create: [{ turmaId: turma1.id }],
          },
        },
      })
    )
  )

  console.log("Criando encontros...")
  const primeiroDomingo = new Date("2026-06-14")
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
          tema: `Encontro ${i + 1}`,
          local: "Paróquia Santo André",
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
  console.log("   Admin: welloliver@gmail.com / admin123")
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
