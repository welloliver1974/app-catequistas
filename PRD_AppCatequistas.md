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
- Redefinição de senha pelo admin (na edição do catequista)
- Proxy protegendo rotas administrativas (exceto `/presenca/confirmar`)
- Página pública `/presenca/confirmar` — **sem login** (catequista seleciona nome)

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

### Turmas
- CRUD completo (nome, descrição)
- Busca por nome na tabela

### Presença
- Confirmação com 1 clique
- Justificativa de ausência com campo de texto
- Prevenção de duplicidade
- Histórico por catequista
- **Página pública** (`/presenca/confirmar`): catequista seleciona nome, vê próximo encontro, confirma/justifica, baixa PDF do encontro
- **Discord automático**: notifica quando alguém confirma presença ou justifica ausência

### Dashboard
- Cards com estatísticas em tempo real
- Contadores animados (Framer Motion)
- Últimas presenças e próximos encontros
- Pulse dot em eventos futuros
- Hover effects

### Relatórios
- **Frequência Individual** (por catequista e período)
- **Frequência por Turma** (ranking com barra percentual)
- **Baixa Frequência** (catequistas abaixo do limite)

### Exportação
- CSV de catequistas, encontros, presenças e frequência
- Impressão como PDF (navegador)
- Backup completo do banco SQLite (`/api/backup`)

### Importação
- Importação via Google Sheets API (3 abas: ListaCatequistas, Temas, Presencas)
- Detecção de duplicidade

### Calendário
- Visualização mensal com encontros destacados
- Navegação entre meses
- Lista completa de encontros abaixo

### Notificações
- Discord via Webhook
- Mensagem personalizada (custom message + auto‑notify próximo encontro)
- **Notificação automática de presença** ao confirmar ou justificar via página pública
- URL do webhook salva no banco (model `Configuracao`), configurável na página de Notificações

### PWA
- Manifesto (`/manifest.json`)
- Service Worker (`sw.js` v2): cache de **assets estáticos apenas** (JS/CSS/imagens), sem cache de páginas HTML
- `skipWaiting` + `clients.claim` para ativação imediata após atualização
- Ícones SVG
- Instalável na tela inicial

---

## 2.1 Deploy & Infraestrutura

### Servidor
- **VPS:** Oracle Cloud (137.131.187.156), Ubuntu
- **App:** Next.js rodando em `0.0.0.0:3003`
- **Gerenciamento:** `nohup npx next start` (sem PM2; systemd pendente)
- **Firewall:** iptables + UFW liberados para porta 3003
- **Acesso SSH:** `ubuntu@137.131.187.156`, key em `~/.ssh/vps_key`

### Cloudflare Tunnel
- **Domínio:** `catequistas.housecloud.tec.br`
- **Container:** `cloudflared-tunnel` (`cloudflare/cloudflared`) com `--network host`
- **Config:** Ingress aponta para `http://localhost:3003`
- **DNS:** Proxied via Cloudflare (HTTP/2 + QUIC)
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
│   ├── seed.ts                         # 12 catequistas, 5 encontros, 60 presenças
│   └── dev.db                          # SQLite
├── public/
│   ├── icons/
│   ├── uploads/encontros/
│   ├── manifest.json
│   └── sw.js                           # v2 - static assets only
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                  # Root layout + PWA meta
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── encontros/
│   │   │   ├── catequistas/
│   │   │   ├── turmas/
│   │   │   ├── presenca/
│   │   │   ├── calendario/
│   │   │   ├── importar/
│   │   │   ├── notificacoes/
│   │   │   └── relatorios/
│   │   │       ├── frequencia/
│   │   │       └── exportar/
│   │   ├── presenca/
│   │   │   └── confirmar/             # Página pública (sem login)
│   │   │       ├── page.tsx
│   │   │       └── client.tsx
│   │   └── api/
│   │       ├── health/
│   │       └── backup/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── catequistas.ts
│   │   ├── encontros.ts
│   │   ├── turmas.ts
│   │   ├── presencas.ts               # Agora dispara Discord ao confirmar/justificar
│   │   ├── relatorios.ts
│   │   ├── exportar.ts
│   │   ├── importar.ts
│   │   ├── notificacoes.ts
│   │   ├── config.ts                  # Get/set Configuracao (persistente)
│   │   └── upload.ts
│   ├── components/
│   │   ├── ui/
│   │   │   └── select.tsx             # Radix-based Select (shadcn/ui style)
│   │   └── pwa/register.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── prisma.ts                  # Singleton + LibSQL adapter
│   └── proxy.ts                       # Route protection (exclui /presenca/confirmar)
├── .env.example
├── .gitignore
├── prisma.config.ts                   # Prisma v7 config (dotenv + defineConfig)
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
npm run seed              # Popular banco com dados de exemplo
npm run dev               # http://localhost:3000
```

### Produção
```bash
npm run build
npx next start -p 3003 -H 0.0.0.0     # http://localhost:3003
```

**Login de teste:** `admin@catequese.com` / `admin123`
**Produção:** https://catequistas.housecloud.tec.br
**Página pública:** https://catequistas.housecloud.tec.br/presenca/confirmar
