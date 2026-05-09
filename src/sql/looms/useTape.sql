SELECT
COUNT(*) AS cnt,
    GROUP_CONCAT(loom_number) AS nomber,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 1 THEN tape_density.density END) AS den_weft,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 2 THEN tape_density.density END) AS den_weft,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 1 THEN warp_quantity.warp_quantity END) as list_warp,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 2 THEN weft_quantity.weft_quantity END) as list_weft,
SUM(CASE WHEN yarn_type.yarn_id = 1 THEN COALESCE(warp_quantity, 0) ELSE 0 END) AS sum_warp,
SUM(CASE WHEN yarn_type.yarn_id = 2 THEN COALESCE(weft_quantity, 0) ELSE 0 END) AS sum_weft
FROM looms
JOIN loom_machine ON looms.model_of_the_loom_id = loom_machine.id
JOIN fabric_recipe ON looms.fabric_recipe_id = fabric_recipe.fabric_recipe_id
JOIN sleeve_width_density swd ON fabric_recipe.sleeve_w_d_id = swd.sleeve_width_density_id
JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id
JOIN yarn_type ON fabric_recipe.yarn_id = yarn_type.yarn_id
LEFT JOIN warp_quantity ON fabric_recipe.quantity_id = warp_quantity.warp_id
LEFT JOIN weft_quantity ON fabric_recipe.quantity_id = weft_quantity.weft_id

JOIN tape_speed ON fabric_recipe.tape_recipe_id = tape_speed.recipe_id
JOIN tape_length ON tape_speed.density_id = tape_length.density_id
JOIN tape_density ON tape_speed.density_id = tape_density.id
JOIN color color_tape ON fabric_recipe.color_id = color_tape.id
JOIN additive ON fabric_recipe.additive_id = additive.id

GROUP BY
    yarn_type.yarn_id,
    tape_density.density,
    color_tape.color,
    additive.additive
ORDER BY tape_density.density ASC