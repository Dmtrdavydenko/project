/*
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
  AND work_date BETWEEN ? AND ?
ORDER BY work_date DESC, shift DESC
*/

SELECT
    weaving_logs.id,
    weaving_logs.work_date,
    weaving_logs.shift,
weaving_logs.loom_number_id AS loom,
weaving_logs.sleeve_production AS production,
    CONCAT(sw.sleeve_width, '/', sd.sleeve_density) AS 'w/d',
GROUP_CONCAT(
  CONCAT_WS('/',
    IF(yarn_type.yarn_id = 2, weft_quantity, NULL),
    IF(yarn_type.yarn_id = 2, tape_density.density, NULL),
    IF(yarn_type.yarn_id = 2, color_tape.color, NULL),
    IF(yarn_type.yarn_id = 2, additive.additive, NULL)
  )
SEPARATOR '') AS weft,
GROUP_CONCAT(
  CONCAT_WS('/',
    IF(yarn_type.yarn_id = 1, warp_quantity, NULL),
    IF(yarn_type.yarn_id = 1, tape_density.density, NULL),
    IF(yarn_type.yarn_id = 1, color_tape.color, NULL),
    IF(yarn_type.yarn_id = 1, additive.additive, NULL)
  )
SEPARATOR '') AS warp
FROM weaving_logs
JOIN fabric_recipe ON weaving_logs.fabric_recipe_id = fabric_recipe.fabric_recipe_id
JOIN sleeve_width_density swd ON fabric_recipe.fabric_wd_id = swd.sleeve_width_density_id
JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id
JOIN yarn_type ON fabric_recipe.yarn_id = yarn_type.yarn_id
LEFT JOIN warp_quantity ON fabric_recipe.quantity_id = warp_quantity.warp_id
LEFT JOIN weft_quantity ON fabric_recipe.quantity_id = weft_quantity.weft_id

JOIN tape_speed ON fabric_recipe.tape_recipe_id = tape_speed.recipe_id
-- JOIN tape_length ON tape_speed.density_id = tape_length.density_id
JOIN tape_length ON (tape_speed.density_id,class_yarn_id) = (tape_length.density_id,2)

JOIN tape_density ON tape_speed.density_id = tape_density.id
JOIN color color_tape ON fabric_recipe.color_id = color_tape.id
JOIN additive ON fabric_recipe.additive_id = additive.id
WHERE user_id = ?
GROUP BY
    weaving_logs.id,
    work_date,
    sleeve_width,
    sleeve_density,
    shift
ORDER BY weaving_logs.work_date DESC, weaving_logs.shift DESC