const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

async function initializeDatabase() {
  try {
    const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL

    const pool = connectionUri
      ? mysql.createPool(connectionUri)
      : mysql.createPool({
          host: process.env.MYSQLHOST || process.env.MYSQL_HOST || "127.0.0.1",
          port: Number.parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || "3306"),
          user: process.env.MYSQLUSER || process.env.MYSQL_USER || "root",
          password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || "",
          database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || "sistemaEnlaces",
        })

    console.log("[init-db] Conectando a la base de datos...")

    const sqlFile = path.join(__dirname, "../database/init.sql")
    const sql = fs.readFileSync(sqlFile, "utf8")

    const statements = sql.split(";").filter((stmt) => stmt.trim())

    for (const statement of statements) {
      try {
        await pool.execute(statement)
        console.log("[init-db] Ejecutado:", statement.substring(0, 50).replace(/\n/g, " ") + "...")
      } catch (error) {
        console.error("[init-db] Error en statement:", error.message)
      }
    }

    console.log("[init-db] Base de datos inicializada correctamente")
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error("[init-db] Error:", error.message)
    process.exit(1)
  }
}

initializeDatabase()
