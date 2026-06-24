UPDATE weaving_logs
SET
    shift = ?,
    loom_number_id = ?,
    fabric_recipe_id = ?,
    sleeve_production = ?
WHERE id = ?
  AND user_id = ?