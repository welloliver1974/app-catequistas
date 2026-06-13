# PRD - App de Cadastro e Controle de Presença de Catequistas

## 1. Visão Geral

**Objetivo:** Aplicação web moderna para substituir o sistema atual baseado em Google Sheets + Apps Script.

**Stack:**
- **Frontend:** Next.js 16 (App Router, Turbopack), Tailwind CSS v4, Shadcn/ui (Nova), Framer Motion, Lucide React
- **Backend:** Next.js Server Actions + Prisma v7 + SQLite (via LibSQL)
- **Tema:** Dark mode fixo, índigo (HSL 245) como primária
- **Fonte:** Geist Sans

**Público-alvo:** Coordenadores de catequese, catequistas e administradores paroquiais.

---

## 2. Funcionalidades Implementadas ✅

### Autenticação
- Login com e-mail e senha (SHA256 + session cookie)
- Alteração de e-mail e senha pelo admin (página `/configuracoes`)
- Redefinição de senha pelo admin (na edição do catequista)
- Proxy protegendo rotas administrativas (exceto `/presenca/confirmar` e `/recuperar-senha`)
- Página pública `/presenca/confirmar` — **sem login** (catequista seleciona nome)
- Cache-Control: no-cache em todas as páginas HTML (evita cache do Cloudflare)

### Catequistas
- CRUD completo (nome, e-mail, telefone, status, observações)
- Busca por nome na tabela
- Vínculo com turmas (leitura)
- Vínculo com usuário do sistema

### Encontros
- CRUD completo (data, tema, local)
- Upload de PDF diretamente no sistema (`public/uploads/encontros/`)
- Ou link do Google Drive
- Busca por tema na tabela
- DatePicker com calendário custom (sem date-fns)

### Turmas
- CRUD completo (nome, descrição)
- Busca por nome na tabela

### Presença
- Confirmação com 1 clique
- Justificativa de ausência com campo de texto
- Prevenção de duplicidade
- **Painel Admin** (`/presenca`): card do próximo encontro, botão WhatsApp para compartilhar link, estatísticas de confirmação, lista de catequistas com status
- **Página pública** (`/presenca/confirmar`): catequista seleciona nome, vê próximo encontro, confirma/justifica, baixa PDF do encontro
- **Discord automático**: notifica quando alguém confirma presença ou justifica ausência

### Dashboard
- Cards com estatísticas em tempo real
- Contadores animados (Framer Motion)
- Últimas presenças e próximos encontros
- Pulse dot em eventos futuros
- Hover effects

### Relatórios
- **Frequência Individual** (por catequista e período) — stats cards + tabela Data/Encontro/Presença/Justificativa
- **Frequência por Turma** (ranking com barra percentual) — stats cards + tabela Catequista/Presenças/Frequência
- **Baixa Frequência** (catequistas abaixo do limite) — stats cards + tabela Catequista/Presenças/Frequência
- Todas as 3 abas com formatação visual idêntica

### Exportação
- CSV de catequistas, encontros, presenças e frequência
- Impressão como PDF (navegador)
- Backup completo do banco SQLite (`/api/backup` + botão em Configurações)

### Importação
- Importação via Google Sheets API (3 abas: ListaCatequistas, Temas, Presencas)
- Detecção de duplicidade

### Calendário
- Visualização mensal com encontros destacados (badge bg-primary/10)
- Navegação entre meses
- Layout com gap-px para visual limpo
- Lista completa de encontros abaixo

### Notificações
- Discord via Webhook
- Mensagem personalizada
- Notificação automática ao confirmar presença ou justificar ausência
- Notificação do próximo encontro (botão na página de Notificações)
- URL do webhook salva no banco (model `Configuracao`)

### PWA
- Manifesto (`/manifest.json`)
- Service Worker (`sw.js` v3): cache de **assets estáticos apenas** (manifest, ícones), sem cache de páginas HTML
- `skipWaiting` + `clients.claim` para ativação imediata após atualização
- Força `reg.update()` no registro
- Ícones SVG
- Instalável na tela inicial

---

## 2.1 Deploy & Infraestrutura

### Servidor
- **VPS:** Oracle Cloud (137.131.187.156), Ubuntu
- **App:** Next.js rodando em `0.0.0.0:3003`
- **Gerenciamento:** Systemd service (`catequistas.service`), auto-start no boot, restart automático se cair
- **Firewall:** iptables + UFW liberados para porta 3003
- **Acesso SSH:** `ubuntu@137.131.187.156`, key em `~/.ssh/vps_key`
- **Processos zumbis:** processos `next-server` antigos (root/opc) são de containers Docker gerenciados por containerd-shim — não afetam o app

### Cloudflare Tunnel
- **Domínio:** `catequistas.housecloud.tec.br`
- **Container:** `cloudflared-tunnel` (`cloudflare/cloudflared`) com `--network host`
- **Config:** Ingress aponta para `http://localhost:3003`
- **DNS:** Proxied via Cloudflare
- **Restart:** `sudo docker restart cloudflared-tunnel`

### Repositório
- **GitHub:** `welloliver1974/app-catequistas`, branch `master`
- `src/generated/prisma/` gitignorado (rodar `npx prisma generate` após clone)

---

## 3. Estrutura do Projeto

```
AppCatequistas/
├── prisma/
│   ├── schema.prisma                   # 7 models
│   ├── migrations/
│   ├── seed.ts                         # 85 catequistas reais (Forania Santo Andre Centro)
│   └── dev.db                          # SQLite (gitignored; root do projeto)
├── public/
│   ├── icons/
│   ├── uploads/encontros/
│   ├── manifest.json
│   └── sw.js                           # v3 - static assets only + reg.update()
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout + PWA meta
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── recuperar-senha/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── encontros/
│   │   │   ├── catequistas/
│   │   │   ├── turmas/
│   │   │   ├── presenca/               # Painel Admin (coordenação)
│   │   │   ├── calendario/
│   │   │   ├── importar/
│   │   │   ├── notificacoes/
│   │   │   ├── configuracoes/          # Alterar email/senha + backup
│   │   │   └── relatorios/
│   │   │       ├── frequencia/
│   │   │       └── exportar/
│   │   ├── presenca/
│   │   │   └── confirmar/             # Página pública (sem login)
│   │   └── api/
│   │       ├── health/
│   │       └── backup/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── catequistas.ts
│   │   ├── encontros.ts
│   │   ├── turmas.ts
│   │   ├── presencas.ts               # Dispara Discord ao confirmar/justificar
│   │   ├── relatorios.ts
│   │   ├── exportar.ts
│   │   ├── importar.ts
│   │   ├── notificacoes.ts
│   │   ├── config.ts                  # Get/set Configuracao
│   │   └── upload.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── select.tsx             # Radix-based Select
│   │   │   ├── calendar.tsx           # Calendar custom (no date-fns)
│   │   │   ├── popover.tsx            # Popover custom (no Radix)
│   │   │   └── date-picker.tsx        # DatePicker (Calendar + Popover)
│   │   └── pwa/register.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── prisma.ts                  # Singleton + LibSQL adapter
│   └── proxy.ts                       # Route protection + Cache-Control headers
├── .env.example
├── .gitignore
├── prisma.config.ts
└── PENDENCIAS.md
```

---

## 4. Banco de Dados (Prisma + SQLite)

7 modelos relacionais:

| Modelo | Descrição |
|--------|-----------|
| `User` | Login do sistema (hash SHA256) |
| `Catequista` | Dados do catequista |
| `Turma` | Turma |
| `TurmaCatequista` | Relação N:N catequista ↔ turma |
| `Encontro` | Encontro (data, tema, local, PDF) |
| `RegistroPresenca` | Presença de catequista em encontro |
| `Configuracao` | Chave-valor para settings persistentes (ex: webhook URL) |

---

## 5. Como Rodar

### Desenvolvimento
```bash
npm install
npx prisma generate       # Gerar Prisma Client
npm run seed              # Popular banco com 85 catequistas reais
npm run dev               # http://localhost:3000
```

### Produção
```bash
npm run build
sudo systemctl restart catequistas      # Gerencia via systemd (auto-start + restart)
```

**Admin:** `welloliver@gmail.com` (senha definida pelo usuário)
**Produção:** https://catequistas.housecloud.tec.br
**Página pública:** https://catequistas.housecloud.tec.br/presenca/confirmar
