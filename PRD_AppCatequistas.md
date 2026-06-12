# PRD - App de Cadastro e Controle de Presença de Catequistas

## 1. Visão Geral

**Objetivo:** Aplicação web moderna para substituir o sistema atual baseado em Google Sheets + Apps Script.

**Stack:**
- **Frontend:** Next.js 16 (App Router), Tailwind CSS v4, Shadcn/ui (Nova), Framer Motion, Lucide React
- **Backend:** Next.js Server Actions + Prisma v7 + SQLite (via LibSQL)
- **Tema:** Dark mode fixo, verde como primária
- **Fonte:** Geist Sans

**Público-alvo:** Coordenadores de catequese, catequistas e administradores paroquiais.

---

## 2. Funcionalidades Implementadas ✅

### Autenticação
- Login com e-mail e senha (SHA256 + session cookie)
- Redefinição de senha pelo admin (na edição do catequista)
- Proxy protegendo rotas administrativas

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

### Dashboard
- Cards com estatísticas em tempo real
- Contadores animados (Framer Motion)
- Últimas presenças e próximos encontros
- Pulse dot em eventos futuros

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
- Mensagem personalizada
- Notificação automática do próximo encontro

### PWA
- Manifesto (`/manifest.json`)
- Service Worker com cache de assets estáticos apenas (sem cache de páginas HTML)
- `skipWaiting` + `clients.claim` para ativação imediata
- Ícones SVG
- Instalável na tela inicial

---

## 2.1 Deploy & Infraestrutura

### Servidor
- **VPS:** Oracle Cloud (137.131.187.156), Ubuntu
- **App:** Next.js rodando em `0.0.0.0:3003`
- **PM2:** Gerenciamento de processo
- **Firewall:** iptables + UFW liberados para porta 3003

### Cloudflare Tunnel
- **Domínio:** `catequistas.housecloud.tec.br`
- **Container:** `cloudflare/cloudflared` com `--network host`
- **Config:** Ingress aponta para `http://localhost:3003`
- **DNS:** Proxied via Cloudflare (HTTP/2 + QUIC)

---

## 3. Estrutura do Projeto

```
AppCatequistas/
├── prisma/
│   ├── schema.prisma
│   └── dev.db
├── public/
│   ├── icons/
│   ├── uploads/encontros/
│   ├── manifest.json
│   └── sw.js
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
│   │   └── api/
│   │       ├── health/
│   │       └── backup/
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── catequistas.ts
│   │   ├── encontros.ts
│   │   ├── turmas.ts
│   │   ├── presencas.ts
│   │   ├── relatorios.ts
│   │   ├── exportar.ts
│   │   ├── importar.ts
│   │   ├── notificacoes.ts
│   │   └── upload.ts
│   ├── components/
│   │   ├── ui/
│   │   └── pwa/register.tsx
│   ├── lib/
│   │   ├── utils.ts
│   │   └── prisma.ts
│   └── proxy.ts
├── .env
└── PENDENCIAS.md
```

---

## 4. Banco de Dados (Prisma + SQLite)

6 modelos relacionais: `User`, `Catequista`, `Turma`, `TurmaCatequista`, `Encontro`, `RegistroPresenca`.

---

## 5. Como Rodar

```bash
npm install
npm run seed        # Popular banco com dados de exemplo
npm run dev         # http://localhost:3000
npm run build       # Build de produção
npm run start       # next start -p 3003 (produção)
```

**Login de teste:** `admin@catequese.com` / `admin123`
**Produção:** https://catequistas.housecloud.tec.br
