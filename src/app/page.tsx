"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Church, Users, ClipboardCheck, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: Users,
    title: "Cadastro de Catequistas",
    desc: "Gerencie todos os catequistas com informações completas e vínculo com turmas.",
  },
  {
    icon: ClipboardCheck,
    title: "Controle de Presença",
    desc: "Registre presenças de forma rápida com histórico completo por catequista.",
  },
  {
    icon: BarChart3,
    title: "Relatórios",
    desc: "Acompanhe a frequência com relatórios individuais e por turma.",
  },
  {
    icon: Church,
    title: "Encontros",
    desc: "Organize encontros com data, tema, local e materiais em PDF.",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Church className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">AppCatequistas</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Começar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div
            className="relative z-10 flex flex-col items-center text-center max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8">
                <Church className="h-4 w-4" />
                Controle de Presença para Catequese
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              Cadastro e Presença
              <br />
              <span className="text-primary">de Catequistas</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-xl mb-10"
            >
              Sistema moderno para gerenciar catequistas, controlar presenças em encontros
              e gerar relatórios de frequência. Tudo em um só lugar.
            </motion.p>

            <motion.div variants={itemVariants} className="flex gap-4">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/login">Acessar Plataforma</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8" asChild>
                <a href="#features">Saiba Mais</a>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        <section id="features" className="px-6 pb-24 max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <feature.icon className="h-10 w-10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-muted-foreground">
          AppCatequistas &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
