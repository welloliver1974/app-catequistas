# Deploy — App Catequistas

## 📦 Infraestrutura

| Item | Detalhe |
|---|---|
| **VPS** | Oracle Cloud — `137.131.187.156` |
| **SO** | Ubuntu |
| **Domínio** | `https://catequistas.housecloud.tec.br` |
| **App** | Next.js rodando em `0.0.0.0:3003` |
| **Proxy reverso** | Cloudflare Tunnel (container `cloudflared-tunnel`) |
| **Gerenciamento** | Systemd service (`catequistas.service`) |

## 🔑 Acesso SSH

```bash
ssh meu-vps
```

> A chave SSH está configurada no arquivo `~/.ssh/config` do usuário `welld`.
> Não compartilhe arquivos de chave privada (.key, .pem).

## 🚀 Deploy manual

Conecte via SSH e rode:

```bash
cd /home/ubuntu/app-catequistas
git pull origin master
npm ci
npm run build
sudo systemctl restart catequistas
```

Ou use o script automatizado:

```bash
./scripts/deploy.sh
```

## 🔄 Manutenção

### Reiniciar o app

```bash
sudo systemctl restart catequistas
```

### Ver status

```bash
sudo systemctl status catequistas
```

### Ver logs

```bash
sudo journalctl -u catequistas -n 50 --no-pager
```

### Backup do banco (local)

Automático via cron (03:00, retenção de 30 dias):

```bash
./scripts/backup.sh
```

### Backup na nuvem (Google Drive)

Os backups são sincronizados automaticamente para o Google Drive todos os dias às 03:05.

**Pré-requisito (fazer UMA VEZ):** Configurar o rclone com sua conta Google.

```bash
# Conecte no servidor
ssh meu-vps

# Configure o Google Drive (precisa de navegador para autenticar)
rclone config

# Siga o assistente:
#   1. "n" (new remote)
#   2. Nome: "gdrive"
#   3. Selecione "drive" (Google Drive)
#   4. Deixe client_id e client_secret em branco (usa padrão)
#   5. Selecione "1" (Full access)
#   6. Deixe service_account_file em branco
#   7. "n" (no advanced config)
#   8. "y" (yes, auto config) → abre navegador para autenticar
#   9. "q" (quit)
```

Após configurar, o backup para a nuvem roda automaticamente. Para testar:

```bash
./scripts/backup-cloud.sh
```

> ⚠️ O `rclone config` precisa de um navegador. Se estiver no terminal sem interface, use `rclone config --headless` e siga as instruções.

### Restart do Cloudflare Tunnel

```bash
sudo docker restart cloudflared-tunnel
```

## 🧪 Desenvolvimento (local)

```bash
npm install
npx prisma generate
npm run seed
npm run dev
# Abre em http://localhost:3000
```

**Login local:** `admin@catequese.com` / `admin123`
**Login produção:** `welloliver@gmail.com` (senha definida por você)

## 📁 Estrutura no servidor

```
/home/ubuntu/app-catequistas/
├── dev.db              # Banco SQLite
├── backups/            # Backups automáticos
├── public/uploads/     # PDFs dos encontros
├── .env                # Variáveis de ambiente
├── scripts/
│   ├── deploy.sh       # Deploy automatizado
│   └── backup.sh       # Backup do banco
```

## ⚙️ Configuração do Systemd

O serviço `catequistas.service` está configurado em `/etc/systemd/system/catequistas.service` com:
- Auto-start no boot
- Restart automático se cair
- ExecStartPre que mata processo na porta 3003 antes de iniciar
