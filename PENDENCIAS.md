# Pendências - App Catequistas

## ✅ Concluído

- [x] Projeto Next.js 16 configurado e buildando
- [x] Tema escuro fixo com Tailwind v4 + Shadcn/ui (Nova)
- [x] Landing page com animações (Framer Motion)
- [x] Tela de login com autenticação real (server action + cookie)
- [x] Dashboard com sidebar, cards de estatísticas e dados reais
- [x] Banco SQLite com Prisma v7 (7 tabelas relacionais)
- [x] Seed com 85 catequistas reais (Forania Santo Andre Centro)
- [x] Proxy protegendo rotas (login obrigatório) + Cache-Control headers
- [x] Logout funcional
- [x] CRUD de Encontros (criar, editar, excluir, listar) + upload PDF + DatePicker
- [x] CRUD de Catequistas (criar, editar, excluir, listar, status ativo/inativo)
- [x] CRUD de Turmas (criar, editar, excluir, listar)
- [x] Painel Admin (`/presenca`) — card próximo encontro, WhatsApp share, stats, lista catequistas
- [x] Página pública de presença (`/presenca/confirmar`) — sem login
- [x] Discord automático ao confirmar presença / justificar ausência
- [x] Relatórios de Frequência (Individual, Por Turma, Baixa Frequência) — formatação idêntica
- [x] Exportar CSV (catequistas, encontros, presenças, frequência)
- [x] Calendário mensal com encontros destacados
- [x] Importar via Google Sheets API
- [x] Backup do banco (`/api/backup` + botão em Configurações)
- [x] Configurações (alterar e-mail e senha)
- [x] Recuperação de senha (placeholder)
- [x] Notificações Discord configuráveis
- [x] PWA (manifest + service worker v3 + ícones)
- [x] Deploy via Cloudflare Tunnel (catequistas.housecloud.tec.br)
- [x] Tema índigo (HSL 245)
- [x] Select Radix (substitui native select branco)
- [x] Calendar/Popover/DatePicker custom (sem date-fns)
- [x] Color-scheme fix (inline no body)
- [x] Service worker v3 com reg.update() forçado
- [x] Vincular catequistas à turma ao criar/importar (catequistas.ts, importar.ts)
- [x] Systemd service com auto-restart no boot
- [x] ExecStartPre que mata processo na porta 3003 antes de iniciar

## 🔲 Pendente

| Tarefa | Tempo | Status |
|---|---|---|
| **Múltiplas paróquias** | ~1h | Pendente |
| **Recuperação de senha real** (envio de email) | ~30 min | Pendente |
| **Resumo em áudio** (TTS) | ~30 min | Pendente |
| **Quiz automático** (IA gera perguntas sobre o tema) | ~1h | Pendente |
| **QR code p/ confirmação de presença** | ~1h | Pendente |
| **Aviso inteligente no WhatsApp** (sugestão baseada no histórico) | ~1h | ✅ Concluído |
| **Análise de temas recorrentes** (IA detecta padrões nos resumos) | ~1h | Pendente |

---

## 🔑 Acesso

- **Admin:** `welloliver@gmail.com` (senha definida pelo usuário)
- **Produção:** https://catequistas.housecloud.tec.br
- **Página pública:** https://catequistas.housecloud.tec.br/presenca/confirmar
- **VPS:** `ssh -i ~/.ssh/vps_key ubuntu@137.131.187.156`
