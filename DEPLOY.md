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

> [!TIP]
> **Permissão da chave no Windows (se der erro de chave aberta):**
> ```powershell
> icacls "C:\Users\welld\.ssh\vps_key_ubuntu" /inheritance:r
> icacls "C:\Users\welld\.ssh\vps_key_ubuntu" /grant:r "$($env:USERNAME):(R,W)"
> ```

## 🚀 Deploy direto da máquina local (Recomendado)

Você pode disparar o deploy completo com um único comando no terminal da sua máquina:

```powershell
# 1. Enviar alterações para o GitHub
git add .
git commit -m "feat/fix: descricao das alteracoes"
git push origin master

# 2. Executar deploy remoto no VPS via SSH (preservando o banco de dados)
ssh meu-vps "cd /home/ubuntu/app-catequistas && cp dev.db dev.db.bak_seguranca && git stash && git pull origin master && cp dev.db.bak_seguranca dev.db && npm ci && npm run build && sudo systemctl restart catequistas"
```

## 🚀 Deploy manual (direto no servidor)

Conecte via SSH (`ssh meu-vps`) e rode:

```bash
cd /home/ubuntu/app-catequistas
cp dev.db dev.db.bak_seguranca
git stash
git pull origin master
cp dev.db.bak_seguranca dev.db
npm ci
npm run build
sudo systemctl restart catequistas
```

Ou use o script automatizado no servidor:

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

### Backup na nuvem (Google Drive) ✅

O backup é enviado automaticamente para o Google Drive todos os dias às 03:05.

**Pasta no Drive:** `catequistas-backups`

**Testar manualmente:**

```bash
./scripts/backup-cloud.sh
```

**Listar backups no Drive:**

```bash
rclone ls gdrive:catequistas-backups/
```

> ⚠️ O rclone usa o client_id compartilhado. Se parar de funcionar, crie seu próprio: https://rclone.org/drive/#making-your-own-client-id

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
