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
- [x] **Quiz automático** — IA gera perguntas de múltipla escolha sobre o tema
- [x] **Resumo em áudio (TTS)** — Web Speech API lê o resumo do encontro em voz alta
- [x] **Mensagens para grupo WhatsApp** — Página com 4 tipos de mensagem geradas por IA (lembrete, agradecimento, comunicado, livre) com cópia automática
- [x] **Tema claro/escuro** — Alternância entre dark e light com botão no menu, salva preferência no localStorage
- [x] **Backup nuvem (Google Drive)** — Backup automático do banco via rclone, cron diário 03:05
- [x] **Notificação Push** — Recebe push no celular quando catequista confirma presença ou justifica ausência
- [x] **QR code** para encontros — botão com modal, download SVG, abrir link
- [x] **Página pública de Histórico** (`/presenca/historico`) — seleção + verificação por telefone + stats + lista cronológica
- [x] **Resumo da IA no histórico** — catequista expande e vê o conteúdo do encontro (se o admin gerou resumo)
- [x] **Mural de avisos** — avisos visíveis no histórico público, editável pelo admin em Configurações
- [x] **Importar WhatsApp** — upload .txt, extração de números, combobox com busca para atribuir aos catequistas
- [x] **Telefones sem prefixo 55** — todos os formulários limpam o código do país automaticamente
- [x] **Sincronização Diocesana** — um clique envia presenças para a planilha da Escola Diocesana (Apps Script + `numeroEncontro`)
- [x] **Seletor de encontro + marcação retroativa** — painel admin escolhe qualquer encontro (inclusive passados) e marca Presente/Ausente/Pendente
- [x] **Encontros ordenados por número** — lista e seletor usam o Nº do encontro (1, 2, 3...), não a data
- [x] **Link público honra `?encontro=`** — QR/WhatsApp/link caem no encontro exato, à prova de fuso horário
- [x] **Proteção de rotas** — `/mensagens` e `/assistente` pedem login; `/presenca/historico` volta a ser público
- [x] **Análise de temas recorrentes** — IA mapeia os temas dos resumos e sugere os próximos encontros
- [x] **Correção de datas (fuso)** — encontros gravados em meio-dia UTC (`T12:00:00Z`) para não deslocar o dia no fuso Brasília
- [x] **Suporte a NVIDIA (NIM) e Custom AI** — Adicionado NVIDIA (Llama 3.3 70B, DeepSeek R1/V3, Nemotron, Mistral) e Provedor Personalizado com Base URL (Ollama, LM Studio, etc.)
- [x] **Listagem dinâmica de modelos de IA** — Botão "Listar da API" que consulta `/models` com a chave do usuário em tempo real
- [x] **Persistência de chaves por provedor no projeto** — Chaves salvas separadamente no SQLite (`dev.db`) por provedor, lembrando automaticamente ao alternar
- [x] **Teste de conexão de IA com medição de latência** — Validação instantânea da chave e modelo antes de salvar
- [x] **Deploy remoto automatizado** — Scripts e fluxo documentados para deploy via SSH direto da máquina local
- [x] **Seletor Rápido na Presença Pública com Iniciais A-Z e Memória** — Substituído o `<Select>` comum por barra de letras iniciais (zero digitação, 2 toques no celular), memória no aparelho (`localStorage`) para confirmação em 1 toque a partir do 2º encontro e busca opcional
- [x] **Organização da Sidebar em Categorias** — Agrupamento dos links em 4 blocos visuais (`Geral`, `Catequese`, `Pastoral & IA`, `Sistema`) com títulos sutis e ergonomia no desktop e drawer mobile
- [x] **Contexto Total no Assistente IA (`perguntarAoAssistente`)** — Removido o corte `.slice(0, 20)`; agora envia a totalidade dos 85 catequistas com telefones e turmas consolidadas para resposta precisa sobre qualquer pessoa
- [x] **Chamada Offline para o Coordenador (`/presenca/chamada`)** — Interface dedicada para chamada presencial rápida, persistência em `localStorage` para uso sem internet e botão de sincronização em lote com o banco

## 🔲 Pendências e Ideias Futuras (Backlog)

### 🎯 UX & Navegação
- [ ] **URL Dinâmica no Compartilhamento WhatsApp**: Substituir a URL fixa `catequistas.housecloud.tec.br` em `src/app/(dashboard)/presenca/client.tsx` por resolução dinâmica (`window.location.origin` ou `process.env.NEXT_PUBLIC_SITE_URL`), garantindo que funcione perfeitamente em dev e em produção.

### 🧠 Inteligência Artificial & Dados
- [ ] **Áudio do Resumo (TTS) na Área Pública**: Permitir que os catequistas ouçam a leitura em áudio do resumo do encontro diretamente no histórico público ou na confirmação de presença.

### 🔒 Segurança & Contas
- [ ] **Assinatura Criptográfica no Cookie de Sessão**: Adicionar assinatura HMAC/JWT ao cookie `session` para proteger contra adulteração de IDs.
- [ ] **Salt no Hash de Senha**: Migrar o hash `sha256` simples para `bcrypt` ou `argon2` com salt.
- [ ] **Recuperação Real de Senha**: Implementar fluxo real de recuperação via e-mail ou código de verificação pelo WhatsApp.

### ⛪ Expansão Pastoral
- [ ] **Filtros por Turma nos Relatórios**: Permitir filtrar relatórios e exportações diretamente por Turma (Crisma, Primeira Eucaristia, Adultos, etc.).
- [ ] **Múltiplas Paróquias / Foranias**: Suporte a isolamento multi-tenant por paróquia.

---

## 🔑 Acesso

- **Admin:** `welloliver@gmail.com` (senha definida pelo usuário)
- **Produção:** https://catequistas.housecloud.tec.br
- **Página pública:** https://catequistas.housecloud.tec.br/presenca/confirmar
- **VPS:** `ssh -i ~/.ssh/vps_key ubuntu@137.131.187.156`
