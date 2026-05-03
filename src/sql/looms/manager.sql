SELECT
    loom_number,
    sleeve_width,
    sleeve_density,
    CONCAT(sw.sleeve_width, '/', sd.sleeve_density) as w_d,
    looms.fabric_recipe_id,
    model_of_the_loom_id,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 1 THEN warp_quantity END) AS q_warp,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 2 THEN weft_quantity END) AS q_weft,

    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 1 THEN tape_density.density END) AS d_warp,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 2 THEN tape_density.density END) AS d_weft,

    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 1 THEN color_tape.color END) AS color_warp,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 2 THEN color_tape.color END) AS color_weft,

    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 1 THEN additive.additive_name END) AS additive_warp,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 2 THEN additive.additive_name END) AS additive_weft,

    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 1 THEN additive.additive_name END) AS warp,
    GROUP_CONCAT(CASE WHEN yarn_type.yarn_id = 2 THEN additive.additive_name END) AS weft
    
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
JOIN color color_tape ON fabric_recipe.color_id = color_tape.color_id
JOIN additive ON fabric_recipe.additive_id = additive.additive_id

GROUP BY
    loom_number,
    sleeve_width,
    sleeve_density,
    looms.fabric_recipe_id,
    model_of_the_loom_id
ORDER BY loom_number;