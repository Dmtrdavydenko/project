SELECT
    fr.fabric_recipe_id,
    fw.sleeve_width,
    fd.sleeve_density,
    type.yarn_name,
    tape_density.density AS tape_density,
    CASE
        WHEN type.yarn_id = 1 THEN warp.warp_quantity
        WHEN type.yarn_id = 2 THEN weft.weft_quantity
        ELSE NULL
    END AS quantity,
    c.color,
    ad.additive

FROM fabric_recipe fr
JOIN fabric_wd f                 ON fr.fabric_recipe_id = f.fabric_wd_id

JOIN sleeve_width_density fwd    ON fr.fabric_wd_id = fwd.sleeve_width_density_id
JOIN sleeve_width fw             ON fwd.sleeve_width_id = fw.sleeve_width_id
JOIN sleeve_density fd           ON fwd.sleeve_density_id = fd.sleeve_density_id

JOIN tape_speed                  ON fr.tape_recipe_id = tape_speed.recipe_id
JOIN tape_length                 ON (tape_speed.density_id,tape_length.class_yarn_id) = (tape_length.density_id,2)
JOIN tape_density                ON tape_speed.density_id = tape_density.id
                                 
JOIN color c                     ON fr.color_id = c.id
JOIN additive ad                 ON fr.additive_id = ad.id
LEFT JOIN warp_quantity warp     ON fr.quantity_id = warp.warp_id
LEFT JOIN weft_quantity weft     ON fr.quantity_id = weft.weft_id
JOIN yarn_type type              ON fr.yarn_id = type.yarn_id
ORDER BY
fw.sleeve_width,
fd.sleeve_density,
tape_density,
c.color,
ad.additive,
fr.fabric_recipe_id,
type.yarn_name DESC