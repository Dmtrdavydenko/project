SELECT
    id,
    work_date,
    shift,
    loom_number_id,
    fabric_recipe_id,
    sleeve_production
FROM weaving_logs
WHERE id = ?
  AND user_id = ?