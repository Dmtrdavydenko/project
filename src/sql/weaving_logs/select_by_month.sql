SELECT
    SUM(sleeve_production) AS total_production
FROM weaving_logs
WHERE user_id = ?
  AND YEAR(work_date) = ?
  AND MONTH(work_date) = ?