-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  name VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sesiones
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Tabla de enlaces
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
);

-- Tabla de rifas
CREATE TABLE IF NOT EXISTS rifas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  numero VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'activo',
  ganador VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_number (user_id, numero),
  INDEX idx_user_id (user_id),
  INDEX idx_estado (estado)
);

-- Insertar usuario admin por defecto (contraseña: admin123)
INSERT INTO users (email, password_hash, role, name, activo) 
VALUES ('admin@rifa.local', '$2b$10$LBFaHFQrB.w79jdoqLQzTeIn62vF.R7IbjRXVz80bHcZ9CJ3rz81q', 'admin', 'Administrador', true)
ON DUPLICATE KEY UPDATE email = email;

-- Insertar usuario de prueba (contraseña: test123)
INSERT INTO users (email, password_hash, role, name, activo) 
VALUES ('test@rifa.local', '$2b$10$UnLdLrPRZ5HjYjbpZRtaie2WHgK3BWSwYCGx.w4E1YU/kX585tNnq', 'user', 'Usuario Prueba', true)
ON DUPLICATE KEY UPDATE email = email;
