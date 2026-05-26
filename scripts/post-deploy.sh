#!/bin/bash
set -e

echo "🚀 Ejecutando migraciones después del despliegue..."
npx prisma migrate deploy

echo "✅ Migraciones completadas"
