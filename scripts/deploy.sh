#!/bin/bash
# Deploy manual: puxa do GitHub, instala deps, build e reinicia o serviço
# Uso: ./scripts/deploy.sh

set -e

cd /home/ubuntu/app-catequistas

echo "==> git pull"
git pull origin master

echo "==> npm ci"
npm ci

echo "==> npm run build"
npm run build

echo "==> systemctl restart catequistas"
sudo systemctl restart catequistas

echo "==> Deploy concluído!"
sudo systemctl status catequistas --no-pager
