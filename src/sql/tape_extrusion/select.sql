SELECT
   tape_extrusion.recipe_id AS tape_recipe_id,
   -- tape_extrusion.tape_id AS tape_speed_id,
   -- tape_speed.density_id AS tape_density_id,
   -- tape_extrusion.color_id AS tape_color_id,
   -- tape_extrusion.additive_id AS tape_additive_id,
   -- yarn_type.yarn_id,
   -- tape_density.id AS density_id,
   -- tape_length.id AS length_id,
   -- color.id AS color_id,
   -- additive.id AS additive_id,
   -- tape_speed.recipe_id AS tape_speed_recipe_id,
    yarn_type.yarn_name,
    tape_density.density,
    tape_length.length,
    color.color,
    additive.additive,
    tape_speed.thread_speed_id AS tape_speed,
    tape_speed.thread_time AS tape_interval
FROM tape_extrusion
JOIN tape_speed ON tape_extrusion.tape_id = tape_speed.recipe_id
JOIN tape_density ON tape_speed.density_id = tape_density.id
JOIN tape_length ON tape_speed.density_id = tape_length.density_id
JOIN yarn_type ON tape_length.class_yarn_id = yarn_type.yarn_id
JOIN color ON tape_extrusion.color_id = color.id
JOIN additive ON tape_extrusion.additive_id = additive.id
ORDER BY tape_length.density_id ASC;