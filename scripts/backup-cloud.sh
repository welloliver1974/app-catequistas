#!/bin/bash
# Backup do banco SQLite para Google Drive via rclone
# Uso: ./scripts/backup-cloud.sh
# Pré-requisito: rclone config (configurar Google Drive remote)

set -e

BACKUP_DIR="/home/ubuntu/app-catequistas/backups"
DB_PATH="/home/ubuntu/app-catequistas/dev.db"
RCLONE_REMOTE="gdrive"
RCLONE_PATH="catequistas-backups"

# Verifica se o remote existe
if ! rclone listremotes 2>/dev/null | grep -q "$RCLONE_REMOTE:"; then
    echo "Remote $RCLONE_REMOTE nao configurado."
    echo "Execute: rclone config"
    exit 1
fi

# Gera backup local primeiro
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.db"
cp "$DB_PATH" "$BACKUP_FILE"
echo "Backup local: $BACKUP_FILE"

# Envia para Google Drive
rclone copy "$BACKUP_FILE" "$RCLONE_REMOTE:$RCLONE_PATH/" 2>&1
echo "Enviado para Google Drive: $RCLONE_REMOTE:$RCLONE_PATH/"

# Remove backups locais mais antigos que 30 dias
find "$BACKUP_DIR" -name "backup-*.db" -mtime +30 -delete
echo "Backups locais antigos (>30 dias) removidos."
echo "Backup concluido com sucesso!"
