# App Catequistas

Sistema de cadastro e controle de presença de catequistas.

Substitui o sistema antigo baseado em Google Sheets + Apps Script.

## Início rápido

```bash
npm install
npx prisma generate
npm run seed
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

**Login:** `admin@catequese.com` / `admin123`

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servidor de produção (após build) |
| `npm run seed` | Popular banco com dados de exemplo |
| `npx prisma studio` | Interface do banco de dados |

## Produção (VPS)

```bash
# 1. Instalar Node.js 20+ e git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt install -y nodejs git

# 2. Clonar e instalar
git clone https://github.com/welloliver1974/app-catequistas.git
cd app-catequistas
cp .env.example .env
npm install
npx prisma generate
npm run seed
npm run build

# 3. Rodar com PM2 (mantém online após reboot)
npm install -g pm2
pm2 start npm --name "catequistas" -- start
pm2 save
pm2 startup

# 4. Proxy reverso (Nginx)
sudo apt install -y nginx
# Configure /etc/nginx/sites-available/catequistas apontando para localhost:3000
```

O app roda em `http://localhost:3000`. Use Nginx como proxy reverso com SSL (Certbot) pra expor na porta 443.

## Estrutura

- `src/app/` — Páginas e layouts
- `src/actions/` — Server actions (auth, CRUDs, relatórios, etc.)
- `src/components/` — UI e componentes
- `src/lib/prisma.ts` — Conexão com banco SQLite
- `src/proxy.ts` — Proteção de rotas (middleware)
- `prisma/schema.prisma` — Schema do banco
- `public/uploads/encontros/` — PDFs enviados
