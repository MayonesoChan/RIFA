const mysql = require("mysql2/promise")
const fs = require("fs")
const path = require("path")

async function migrate() {
  try {
    const connectionUri = process.env.MYSQL_URL || process.env.DATABASE_URL

    if (!connectionUri && !process.env.MYSQLHOST) {
      console.log("[migrate] No database connection found, skipping migrations")
      process.exit(0)
    }

    const pool = connectionUri
      ? mysql.createPool(connectionUri)
      : mysql.createPool({
          host: process.env.MYSQLHOST || process.env.MYSQL_HOST || "127.0.0.1",
          port: Number.parseInt(process.env.MYSQLPORT || process.env.MYSQL_PORT || "3306"),
          user: process.env.MYSQLUSER || process.env.MYSQL_USER || "root",
          password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || "",
          database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || "sistemaEnlaces",
        })

    console.log("[migrate] Ejecutando migraciones...")

    const sqlFile = path.join(__dirname, "../database/init.sql")
    const sql = fs.readFileSync(sqlFile, "utf8")

    const statements = sql.split(";").filter((stmt) => stmt.trim())

    for (const statement of statements) {
      try {
        await pool.execute(statement)
      } catch (error) {
        if (!error.message.includes("already exists") && !error.message.includes("Duplicate entry")) {
          console.error("[migrate] Error:", error.message)
        }
      }
    }

    console.log("[migrate] Migraciones completadas")
    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error("[migrate] Error fatal:", error.message)
    process.exit(1)
  }
}

migrate()
