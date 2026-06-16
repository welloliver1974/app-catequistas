# PWA + Chamada Offline — AppCatequistas

Instalar o app no celular como PWA e permitir fazer chamada sem internet.

---

## O que vai mudar

### Parte 1 — PWA (Instalável no Celular)

#### [NEW] `src/app/manifest.ts`
- `display: "standalone"` → tela cheia sem barra do browser
- `start_url: "/dashboard"` → abre direto no dashboard
- Cores da paleta primária do app (`#3b2fa8`)
- Referência aos ícones em `public/`

#### [NEW] `public/sw.js` (Service Worker)
- Cache do shell (HTML, CSS, JS) para carregamento rápido
- Intercepta requests de rede: se offline, serve do cache

#### [NEW] `public/icon-192.png` e `public/icon-512.png`
- Gerado com a ferramenta `generate_image`

#### [MODIFY] `next.config.ts`
- Adicionar headers corretos para `sw.js` (`no-cache`)

#### [MODIFY] `src/app/layout.tsx`
- Registrar o service worker via `<Script>` no lado cliente

---

### Parte 2 — Chamada Offline

A página `/presenca/confirmar` já existe para os catequistas confirmarem presença.
Vamos criar uma **nova página de chamada para o coordenador** que funciona offline:

#### [NEW] `src/app/(dashboard)/presenca/chamada/page.tsx`
- Carrega os dados da chamada (catequistas do próximo encontro)
- Salva no `localStorage` com chave `chamada_offline_{encontroId}`

#### [NEW] `src/app/(dashboard)/presenca/chamada/client.tsx`
- Lista de catequistas com botões ✅ / ❌
- Estado salvo em `localStorage` a cada toque
- Banner de status: "📶 Online — sincronizado" / "📵 Offline — salvo localmente"
- Botão "Sincronizar agora" que envia os dados ao servidor quando voltar online
- Hook `useOnlineStatus()` para detectar conexão

#### [NEW] `src/actions/presenca-chamada.ts`
- Server Action `sincronizarChamada(encontroId, registros[])` — grava no banco

---

## Verificação

> [!IMPORTANT]
> O PWA só pode ser instalado em HTTPS. Para testar localmente:
> `npx next dev --experimental-https`
> Em produção (Vercel/housecloud) já está em HTTPS — funciona direto.

### Build
- `npm run build` sem erros

### Manual
- Abrir no Chrome mobile → menu → "Adicionar à tela inicial"
- Colocar o celular em modo avião → abrir `/presenca/chamada` → fazer chamada → voltar online → sincronizar

---

## Perguntas abertas

> [!NOTE]
> A página `/presenca/confirmar` (onde os **catequistas** confirmam presença via link público) é diferente da chamada do coordenador. Vou criar uma **nova rota** `/presenca/chamada` só para o coordenador. Isso faz sentido?
