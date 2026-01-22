-- db/init/01_schema.sql
CREATE TABLE IF NOT EXISTS players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_name VARCHAR(32) NOT NULL UNIQUE,
  pass_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  sid CHAR(64) PRIMARY KEY,
  player_id INT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (player_id)
);

CREATE TABLE IF NOT EXISTS scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  player_id INT NOT NULL,
  mode VARCHAR(16) NOT NULL,
  difficulty VARCHAR(16) NOT NULL DEFAULT 'normal',
  stage INT NULL,
  is_clear TINYINT(1) NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  duration_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (player_id), INDEX (mode), INDEX (difficulty)
);

CREATE OR REPLACE VIEW v_ranking_survival_top20 AS
SELECT s.id, p.player_name, s.score, s.duration_ms, s.created_at, s.difficulty
FROM scores s JOIN players p ON p.id = s.player_id
WHERE s.mode='survival'
ORDER BY s.score DESC, s.duration_ms ASC
LIMIT 20;
