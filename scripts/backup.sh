#!/bin/bash
# Backup automático do banco SQLite
# Mantém os últimos 30 backups

BACKUP_DIR="/home/ubuntu/app-catequistas/backups"
DB_PATH="/home/ubuntu/app-catequistas/dev.db"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup-$TIMESTAMP.db"

cp "$DB_PATH" "$BACKUP_FILE"

# Remove backups mais antigos que 30 dias
find "$BACKUP_DIR" -name "backup-*.db" -mtime +30 -delete
