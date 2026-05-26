# Configuración de Base de Datos

Este proyecto utiliza MySQL con conexión mediante `mysql2/promise` en lugar de Prisma para un control más directo de la base de datos.

## Variables de Entorno Requeridas

Debes configurar una de estas opciones:

### Opción 1: Connection URI (Recomendado para Railway)

```bash
MYSQL_URL=mysql://usuario:contraseña@host:puerto/base_datos
```

o

```bash
DATABASE_URL=mysql://usuario:contraseña@host:puerto/base_datos
```

### Opción 2: Variables Individuales

```bash
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=
MYSQLDATABASE=sistemaEnlaces
```

Equivalentemente:

```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=sistemaEnlaces
```

## Configuración en Railway

1. Crea un servicio de MySQL en Railway (o usa el existente)
2. En tu aplicación, agrega el plugin de Railway para MySQL
3. El plugin automáticamente establece las variables `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD` y `MYSQLDATABASE`
4. Alternativamente, puedes configurar `MYSQL_URL` o `DATABASE_URL` manualmente

## Inicializar la Base de Datos

### Opción 1: Script automático

```bash
npm run db:init
```

Este script:
- Crea todas las tablas necesarias
- Inserta usuarios por defecto (admin y test)
- Configura índices para mejor rendimiento

### Opción 2: Migraciones en el despliegue

El archivo `railway.json` está configurado para ejecutar migraciones automáticamente en cada despliegue.

### Opción 3: Manual

Ejecuta el archivo `database/init.sql` directamente en tu cliente MySQL:

```bash
mysql -u root -p < database/init.sql
```

## Estructura de Tablas

### users
- `id` - INT, clave primaria, autoincremento
- `email` - VARCHAR(255), única
- `password_hash` - VARCHAR(255)
- `role` - VARCHAR(50), por defecto 'user'
- `name` - VARCHAR(255)
- `activo` - BOOLEAN, por defecto true
- `created_at` - TIMESTAMP

### sessions
- `id` - VARCHAR(255), clave primaria (UUID)
- `user_id` - INT, referencia a users
- `expires_at` - TIMESTAMP
- `created_at` - TIMESTAMP

### links
- `id` - INT, clave primaria, autoincremento
- `title` - VARCHAR(255)
- `description` - TEXT
- `image_url` - VARCHAR(500)
- `url` - VARCHAR(500)
- `category_id` - INT
- `created_by` - INT, referencia a users
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## Usuarios por Defecto

Después de inicializar:

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@rifa.local | admin123 | admin |
| test@rifa.local | test123 | user |

## Funciones Disponibles en `lib/db.ts`

- `getPool()` - Obtiene el pool de conexiones
- `getUser(email)` - Obtiene un usuario por email
- `getUserById(id)` - Obtiene un usuario por ID
- `createSession(userId)` - Crea una nueva sesión
- `getSession(sessionId)` - Obtiene una sesión válida
- `deleteSession(sessionId)` - Elimina una sesión
- `getAllLinks(userId, userRole)` - Obtiene enlaces (filtrados por rol)
- `createLink(data)` - Crea un nuevo enlace
- `updateLink(id, data)` - Actualiza un enlace
- `deleteLink(id)` - Elimina un enlace
- `executeQuery(query, params)` - Ejecuta queries SQL personalizadas

## Solución de Problemas

### "ECONNREFUSED"
La base de datos no está disponible. Verifica que:
1. El servicio MySQL está ejecutándose
2. Las variables de entorno están configuradas correctamente
3. Las credenciales son válidas

### "Unknown database"
La base de datos especificada no existe. El script `init-db.js` debería crearla, o créala manualmente:

```sql
CREATE DATABASE IF NOT EXISTS sistemaEnlaces;
```

### "Table already exists"
Esto es normal - los scripts están configurados para ignorar errores de tablas ya existentes.

## Migración desde Prisma

Si migras de Prisma:

1. Reemplaza los imports: `import { getPool } from '@/lib/db'`
2. Usa las funciones de `lib/db.ts` en lugar de `prisma.modelo`
3. Las queries SQL son más explícitas pero ofrecen más control
4. Ejecuta `npm run db:init` para crear las tablas

Ejemplo:

```typescript
// Antes (Prisma)
const user = await prisma.user.findUnique({ where: { email } })

// Ahora
import { getUser } from '@/lib/db'
const user = await getUser(email)
```

## Para Desarrolladores

- Los queries están optimizados con índices automáticos
- El pool se reutiliza entre requests para mejor rendimiento
- Las conexiones se cierran automáticamente después de expirar
- Los passwords se hashean con bcryptjs antes de guardar

## Links Útiles

- [mysql2 documentation](https://github.com/sidorares/node-mysql2)
- [Connection pooling](https://github.com/sidorares/node-mysql2#using-connection-pools)
