# Migración de Prisma a MySQL2 Completada

Tu proyecto ha sido migrado exitosamente de Prisma a MySQL2 con conexión nativa a Railway.

## Cambios Realizados

### Instalaciones
- ✅ Instalado `mysql2` versión 3.22.3
- ✅ Removido `@prisma/client` 
- ✅ Removido `prisma`

### Archivos Modificados

#### 1. **lib/db.ts** (Completamente reescrito)
   - Ahora usa `mysql2/promise` en lugar de Prisma
   - Implementa un pool de conexiones reutilizable
   - Funciones para usuarios, sesiones, enlaces y rifas
   - Mejor control sobre queries SQL

#### 2. **lib/db-init.ts** (Completamente reescrito)
   - Inicialización automática de tablas en la primera conexión
   - Creación de usuarios por defecto (admin y test)
   - Mejor manejo de errores

#### 3. **app/api/auth/login/route.ts**
   - Cambio: `import { prisma }` → `import { getUser }`
   - Cambio: `prisma.user.findUnique()` → `getUser(email)`
   - Cambio: `user.password` → `user.password_hash`

#### 4. **app/api/auth/register/route.ts**
   - Cambio: `import { prisma }` → `import { getUser, getPool }`
   - Cambio: `prisma.user.create()` → `pool.execute()` + `getUser()`

#### 5. **app/api/rifas/route.ts** (GET y POST)
   - Cambio: `prisma.rifa.findMany()` → `getUserRifas(userId)`
   - Cambio: `prisma.rifa.create()` → `createRifa(data)`
   - Cambio: `prisma.rifa.findFirst()` → `pool.execute()` con WHERE

#### 6. **app/api/rifas/[id]/route.ts** (PUT y DELETE)
   - Cambio: `prisma.rifa.findUnique()` → `getRifaById(id)`
   - Cambio: `prisma.rifa.update()` → `updateRifa(id, data)`
   - Cambio: `prisma.rifa.delete()` → `deleteRifa(id)`

#### 7. **app/api/health/route.ts**
   - Cambio: `await prisma.$queryRaw` → `await pool.execute('SELECT 1')`

#### 8. **app/api/rifas/search/route.ts**
   - Cambio: `prisma.rifa.findMany()` → `searchRifas(query, userId)`

### Nuevos Archivos

#### **database/init.sql**
- Estructura completa de tablas (users, sessions, links, rifas)
- Índices optimizados
- Usuarios por defecto pre-creados

#### **scripts/init-db.js**
- Script para inicializar la BD manualmente
- Ejecutable con `npm run db:init`

#### **scripts/migrate.js**
- Script de migraciones para producción
- Se ejecuta automáticamente en Railway

#### **railway.toml**
- Configuración de Railway
- Ejecuta migraciones antes de iniciar la app
- Reintentos automáticos

#### **DB_SETUP.md**
- Guía completa de configuración
- Variables de entorno requeridas
- Solución de problemas

## Base de Datos

### Tablas Creadas

1. **users** - Usuarios del sistema
   - id, email, password_hash, role, name, activo, created_at

2. **sessions** - Sesiones de usuario
   - id, user_id, expires_at, created_at

3. **links** - Enlaces del sistema
   - id, title, description, image_url, url, category_id, created_by, created_at, updated_at

4. **rifas** - Números de rifa
   - id, user_id, numero, descripcion, estado, ganador, created_at, updated_at

### Usuarios Por Defecto

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@rifa.local | admin123 | admin |
| test@rifa.local | test123 | user |

## Variables de Entorno

Tu aplicación soporta estas variables (en orden de preferencia):

### Opción 1: Connection URI (Recomendado)
```bash
MYSQL_URL=mysql://user:pass@host:port/database
# o
DATABASE_URL=mysql://user:pass@host:port/database
```

### Opción 2: Variables Individuales
```bash
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=
MYSQLDATABASE=sistemaEnlaces
```

En Railway, el plugin de MySQL establece automáticamente:
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

## Funciones Disponibles en lib/db.ts

### Usuarios
- `getUser(email)` - Obtiene usuario por email
- `getUserById(id)` - Obtiene usuario por ID

### Sesiones
- `createSession(userId)` - Crea una sesión
- `getSession(sessionId)` - Obtiene sesión válida
- `deleteSession(sessionId)` - Elimina sesión

### Rifas
- `getUserRifas(userId)` - Obtiene rifas del usuario
- `getRifaById(id, userId?)` - Obtiene rifa por ID
- `createRifa(data)` - Crea nueva rifa
- `updateRifa(id, data)` - Actualiza rifa
- `deleteRifa(id)` - Elimina rifa
- `searchRifas(numero, userId?)` - Busca rifas

### General
- `getPool()` - Obtiene el pool de conexiones
- `executeQuery(query, params)` - Ejecuta SQL personalizado

## Próximos Pasos

### 1. Configurar en Railway

En tu proyecto de Railway:

1. Agrega un servicio MySQL (si no lo tienes)
2. Conecta tu aplicación al servicio
3. El plugin automáticamente establece las variables
4. Haz deploy

### 2. Ejecutar Migraciones

Las migraciones se ejecutan automáticamente en el deploy. Para hacerlo manualmente:

```bash
npm run db:init
```

### 3. Verificar Healthcheck

```bash
curl https://tu-app.railway.app/api/health
```

Deberías recibir:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-05-26T..."
}
```

## Ventajas de esta Migración

✅ **Mayor Control**: SQL directo en lugar de ORM  
✅ **Mejor Rendimiento**: Pool de conexiones optimizado  
✅ **Compatible con Railway**: Soporta variables automáticas  
✅ **Más Flexible**: Queries personalizadas sin limitaciones de ORM  
✅ **Tipo Seguro**: TypeScript con types correctos  
✅ **Menos Dependencias**: Menos código a mantener  

## Solución de Problemas

### "Cannot find module 'mysql2'"
```bash
pnpm install mysql2
```

### "Error: connect ECONNREFUSED"
- Verifica que la BD está corriendo
- Revisa variables de entorno
- Revisa credenciales

### "Table already exists"
Esto es normal en reintentos - el script lo maneja

### "Duplicate entry"
Los usuarios por defecto existen. Puedes cambiar el email o eliminarlos manualmente.

## Próxima Lectura

- Revisa `DB_SETUP.md` para configuración detallada
- Revisa `lib/db.ts` para ver todas las funciones disponibles
- Revisa los archivos de rutas API para ver ejemplos de uso

## Soporte

Si tienes problemas:

1. Revisa los logs: `npm run dev` y busca errores
2. Verifica variables de entorno
3. Intenta `npm run db:init` para re-inicializar
4. Revisa `DB_SETUP.md` sección "Solución de Problemas"
