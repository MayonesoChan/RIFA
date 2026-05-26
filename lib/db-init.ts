import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"

/**
 * Database initialization script
 * This runs automatically when the connection pool is first created
 * It creates tables and inserts default data if they don't exist
 */
export async function initializeDatabase(pool: mysql.Pool) {
  try {
    console.log("[log] Iniciando verificación de base de datos...")

    // Check if users table exists
    const [tables] = await pool.execute("SHOW TABLES LIKE 'users'")
    const tableList = tables as any[]

    if (tableList.length > 0) {
      console.log("[log] Base de datos ya existe, saltando inicialización")
      return
    }

    console.log("[log] Creando tablas...")

    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        name VARCHAR(255),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create sessions table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      )
    `)

    // Create links table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS links (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        url VARCHAR(500) NOT NULL,
        category_id INT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_created_by (created_by),
        INDEX idx_created_at (created_at)
      )
    `)

    console.log("[log] Tablas creadas exitosamente")

    // Create default admin user
    const hashedPassword = await bcrypt.hash("admin123", 10)
    
    await pool.execute(
      "INSERT INTO users (email, password_hash, role, name, activo) VALUES (?, ?, ?, ?, ?)",
      ["admin@rifa.local", hashedPassword, "admin", "Administrador", true],
    )

    console.log("[log] Usuario admin creado: admin@rifa.local")

    // Create a test user
    const testPassword = await bcrypt.hash("test123", 10)
    await pool.execute(
      "INSERT INTO users (email, password_hash, role, name, activo) VALUES (?, ?, ?, ?, ?)",
      ["test@rifa.local", testPassword, "user", "Usuario Prueba", true],
    )

    console.log("[log] Usuario de prueba creado: test@rifa.local")
    console.log("[log] Base de datos inicializada correctamente")
  } catch (error) {
    console.error("[log] Error inicializando base de datos:", error)
    // Don't throw - allow the app to continue even if initialization fails
  }
}
