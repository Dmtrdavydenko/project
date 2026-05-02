SELECT 
    loom_number,
    sleeve_width, 
    sleeve_density, 
    looms.fabric_recipe_id, 
    model_of_the_loom_id
FROM looms
JOIN loom_machine on looms.model_of_the_loom_id = loom_machine.id
JOIN fabric_recipe on looms.fabric_recipe_id = fabric_recipe.fabric_recipe_id

JOIN sleeve_width_density swd ON fabric_recipe.sleeve_w_d_id = swd.sleeve_width_density_id
JOIN sleeve_width sw ON swd.sleeve_width_id = sw.sleeve_width_id
JOIN sleeve_density sd ON swd.sleeve_density_id = sd.sleeve_density_id

GROUP BY sleeve_width, sleeve_density, loom_number, looms.fabric_recipe_id, model_of_the_loom_id
