# Pendências - App Catequistas

## ✅ Concluído (18/06/2026)

- [x] Projeto Next.js 16 configurado e buildando
- [x] Tema escuro fixo com Tailwind v4 + Shadcn/ui (Nova)
- [x] Landing page com animações (Framer Motion)
- [x] Tela de login com autenticação real (server action + cookie)
- [x] Dashboard com sidebar, cards de estatísticas e dados reais
- [x] Banco SQLite com Prisma v7 (6 tabelas relacionais)
- [x] Seed com dados de exemplo (12 catequistas, 5 encontros, 60 presenças)
- [x] Proxy protegendo rotas (login obrigatório)
- [x] Logout funcional
- [x] **CRUD de Encontros** (criar, editar, excluir, listar)
- [x] **CRUD de Catequistas** (criar, editar, excluir, listar, status ativo/inativo)
- [x] **Página de Presença** (catequista confirma presença no próximo encontro)
- [x] Layout compartilhado com sidebar entre todas as páginas
- [x] Rota de diagnóstico: `/api/health`
- [x] PRD e pendências documentados

---

## 🔲 Fase 1 — Essencial (✅ Concluído)

## 🔲 Fase 2 — Relatórios (✅ Concluído)

## 🔲 Fase 3 — Avançado

| Tarefa | Tempo | Status |
|---|---|---|
| **Múltiplas paróquias** | ~1h | Pendente |
| **Recuperação de senha** | ~15 min | Pendente |

### 🔲 Sugestões Futuras

- [x] **Date picker nos campos de data** — substituído por calendário visual (Calendar + Popover) em encontros e relatórios
- [x] **Contraste na aba Frequência** — resolvido com `color-scheme: dark`
- [x] **Página de Configurações** — criada em `/configuracoes` (trocar e-mail e senha)
- [x] **Recuperação de senha** — criada em `/recuperar-senha` (placeholder sem email)
- [ ] **Aba Presença inacessível** — investigar por que o catequista não consegue acessar a página de presença
- [ ] **Acesso admin real** — trocar e-mail e senha do seed para os dados reais

---

## 📎 Sobre o Upload de PDF dos Encontros
**Decisão a tomar quando for implementar:**

**Opção A — Upload local** (~20 min)
- Salvar PDF em `public/uploads/encontros/`
- Armazenar só o caminho no banco (`encontro.linkPdf`)
- Prós: simples, sem dependência externa
- Contras: ocupa espaço no servidor (mas PDF de material catequético é leve — ~200KB a 2MB cada)

**Opção B — Google Drive** (~15 min)
- Catequista sobe o PDF no Drive, cola o link de compartilhamento
- Armazenar a URL no banco (`encontro.linkPdf`)
- Prós: não ocupa espaço no servidor, catequista gerencia os próprios arquivos
- Contras: depende de internet, precisa gerenciar permissões de acesso

---

## 💻 Como Rodar

```bash
npm run dev        # Iniciar servidor (http://localhost:3000)
npm run seed       # Popular banco com dados de exemplo
npm run build      # Build de produção
```

## 🔑 Login de Teste

- **Admin:** `admin@catequese.com` / `admin123`
- Admin está vinculado à catequista **Ana Maria Silva**

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── (auth)/login/         # Login
│   ├── (dashboard)/
│   │   ├── layout.tsx        # Layout com sidebar
│   │   ├── dashboard/        # Página inicial
│   │   ├── encontros/        # CRUD Encontros
│   │   ├── catequistas/      # CRUD Catequistas
│   │   └── presenca/         # Confirmar presença
│   └── api/health/           # Diagnóstico
├── actions/
│   ├── auth.ts               # Login/logout
│   ├── encontros.ts          # CRUD encontros
│   ├── catequistas.ts        # CRUD catequistas
│   └── presencas.ts          # Confirmar presença
└── components/ui/            # Componentes Shadcn
```
