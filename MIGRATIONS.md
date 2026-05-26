# Guía de Migraciones de Base de Datos

## Configuración Inicial

### 1. Variable de Entorno
Asegúrate de que tienes configurada la variable `DATABASE_URL` en tu proyecto:

```
DATABASE_URL=mysql://usuario:contraseña@host:puerto/nombre_base_datos
```

En Railway, esta URL está disponible en las variables de entorno del servicio PostgreSQL/MySQL.

### 2. Ejecutar Migraciones Localmente

Para aplicar las migraciones en tu entorno local:

```bash
npm run migrate
```

O si prefieres un entorno de desarrollo:

```bash
npm run migrate:dev
```

## En Railway

### Opción 1: Automático (Recomendado)
Las migraciones se ejecutan automáticamente cuando despliegas la aplicación gracias al archivo `railway.json`.

El comando en el deploy es:
```bash
node scripts/migrate.js && next start
```

### Opción 2: Manual
Si necesitas ejecutar las migraciones manualmente en Railway:

1. Abre tu proyecto en Railway
2. Ve a la pestaña de tu aplicación
3. Ejecuta el comando en la terminal:
```bash
npx prisma migrate deploy
```

## Comandos Disponibles

- `npm run migrate` - Ejecuta las migraciones (producción)
- `npm run migrate:dev` - Ejecuta las migraciones en desarrollo
- `npm run db:push` - Sincroniza el schema de Prisma con la BD (sin migraciones)

## Solución de Problemas

### Las tablas aún no se crean
1. Verifica que `DATABASE_URL` esté configurada correctamente
2. Verifica que Railway tiene acceso a la base de datos
3. Ejecuta manualmente: `npm run migrate`

### Error: "Column not found"
Las migraciones pueden no haber corrido correctamente. Intenta:
```bash
npm run migrate
```

### Error de conexión a la BD
- Verifica que `DATABASE_URL` en Railway es correcta
- Asegúrate que la base de datos está corriendo
- Verifica que el firewall permite la conexión
