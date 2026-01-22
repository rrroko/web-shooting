CREATE OR REPLACE VIEW v_survival_best AS
SELECT * FROM (
  SELECT s.*,
         ROW_NUMBER() OVER (
           PARTITION BY s.player_id
           ORDER BY s.duration_ms DESC, s.damage_taken ASC, s.created_at ASC, s.id ASC
         ) AS rn
  FROM scores s
  WHERE s.mode = 'survival'
) t
WHERE t.rn = 1;

CREATE OR REPLACE VIEW v_bossrush_best AS
SELECT * FROM (
  SELECT s.*,
         ROW_NUMBER() OVER (
           PARTITION BY s.player_id
           ORDER BY s.duration_ms ASC, s.damage_taken ASC, s.created_at ASC, s.id ASC
         ) AS rn
  FROM scores s
  WHERE s.mode = 'bossrush' AND s.is_clear = 1
) t
WHERE t.rn = 1;