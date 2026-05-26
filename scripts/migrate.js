const { execSync } = require('child_process');

async function migrate() {
  try {
    console.log('🔄 Iniciando migraciones de Prisma...');
    
    // Ejecutar migraciones
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('✅ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante las migraciones:', error.message);
    process.exit(1);
  }
}

migrate();
