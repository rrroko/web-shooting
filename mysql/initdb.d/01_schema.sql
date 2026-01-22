CREATE TABLE IF NOT EXISTS players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  player_name VARCHAR(32) NOT NULL,
  player_name_lower VARCHAR(32) NOT NULL,
  password_hash VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_player_name_lower (player_name_lower)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  token CHAR(64) NOT NULL,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_hash CHAR(64) NULL,
  ua_hash CHAR(64) NULL,
  INDEX idx_sessions_token (token),
  INDEX idx_sessions_player (player_id),
  CONSTRAINT fk_sessions_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS progress (
  player_id INT PRIMARY KEY,
  unlocked_stage INT NOT NULL DEFAULT 1,
  stars_json JSON NULL,
  last_mode ENUM('story','survival','bossrush','daily') NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_progress_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inventory (
  player_id INT PRIMARY KEY,
  alloy INT NOT NULL DEFAULT 0,
  flux INT NOT NULL DEFAULT 0,
  chip INT NOT NULL DEFAULT 0,
  core INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS upgrades (
  player_id INT NOT NULL,
  `key` VARCHAR(32) NOT NULL,
  level INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, `key`),
  CONSTRAINT fk_upgrades_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS weapons (
  player_id INT NOT NULL,
  weapon_key VARCHAR(32) NOT NULL,
  owned TINYINT(1) NOT NULL DEFAULT 0,
  equipped TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, weapon_key),
  CONSTRAINT fk_weapons_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scores (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  player_id INT NOT NULL,
  mode ENUM('story','survival','bossrush','daily') NOT NULL,
  stage INT NULL,
  is_clear TINYINT(1) NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  duration_ms INT NOT NULL DEFAULT 0,
  waves_cleared INT NULL,
  bosses_defeated INT NULL,
  damage_taken INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  meta_json JSON NULL,
  INDEX idx_scores_player (player_id),
  INDEX idx_scores_mode_time (mode, duration_ms, id),
  INDEX idx_scores_mode_clear_time (mode, is_clear, duration_ms, id),
  CONSTRAINT fk_scores_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS achievements (
  player_id INT NOT NULL,
  `key` VARCHAR(64) NOT NULL,
  unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, `key`),
  CONSTRAINT fk_achievements_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  player_id INT PRIMARY KEY,
  data_json JSON NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_settings_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS players (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  player_name  VARCHAR(32) NOT NULL,
  pass_hash    VARCHAR(255) NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_players_name (player_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  sid         CHAR(64) PRIMARY KEY,
  player_id   INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_player
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS scores (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  player_id    INT NOT NULL,
  mode         VARCHAR(16) NOT NULL,      -- 'story' / 'survival' など
  stage        INT NULL,
  is_clear     TINYINT(1) NOT NULL DEFAULT 0,
  score        INT NOT NULL DEFAULT 0,
  duration_ms  INT NOT NULL DEFAULT 0,    -- 生存/クリア時間(ms)
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_scores_mode_score_time (mode, score DESC, duration_ms ASC),
  INDEX idx_scores_player_time (player_id, created_at DESC),
  CONSTRAINT fk_scores_player
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 任意：ランキング用ビュー（上位20件）
DROP VIEW IF EXISTS v_ranking_survival_top20;
CREATE VIEW v_ranking_survival_top20 AS
SELECT p.player_name, s.score, s.duration_ms, s.created_at
FROM scores s
JOIN players p ON p.id = s.player_id
WHERE s.mode = 'survival'
ORDER BY s.score DESC, s.duration_ms ASC
LIMIT 20;