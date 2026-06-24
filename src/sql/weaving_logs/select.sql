SELECT
    id,
    work_date,
    shift,
    loom_number_id,
    fabric_recipe_id,
    sleeve_production,
    created_at
FROM weaving_logs
WHERE user_id = ?
--  AND work_date BETWEEN ? AND ?
ORDER BY work_date DESC, shift DESC