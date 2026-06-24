SELECT
    SUM(sleeve_production) AS total_production
FROM weaving_logs
WHERE user_id = ?
  AND work_date = ?