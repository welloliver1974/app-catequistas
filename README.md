# App Catequistas

Sistema de cadastro e controle de presença de catequistas.

## Início rápido

```bash
npm install
npx prisma generate
npm run seed
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

**Login:** `admin@catequese.com` / `admin123`

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run seed` | Popula banco com dados de exemplo |
| `npx prisma studio` | Abre interface do banco de dados |

## Estrutura

- `src/app/` — Páginas e layouts
- `src/components/ui/` — Componentes Shadcn/ui
- `src/actions/auth.ts` — Server actions de autenticação
- `src/lib/prisma.ts` — Conexão com banco
- `prisma/schema.prisma` — Schema do banco
- `prisma/seed.ts` — Dados de exemplo
