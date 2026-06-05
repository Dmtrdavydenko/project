SELECT
    COUNT(*) AS cnt,
    l.loom_number AS loom,
    yt.yarn_name AS yarn_type,
    td.density AS tape_density,
    c.color AS tape_color,
    a.additive AS tape_additive,
    MAX(
        CASE
            WHEN yt.yarn_name = 'warp' THEN wq_warp.warp_quantity
            WHEN yt.yarn_name = 'weft' THEN wq_weft.weft_quantity
            ELSE 0
        END
    ) AS quantity
FROM looms l

-- Присоединяем рецепты ткани
JOIN fabric_recipe fr ON l.fabric_recipe_id = fr.fabric_recipe_id

-- Присоединяем тип нити
JOIN yarn_type yt ON fr.yarn_id = yt.yarn_id

-- Присоединяем плотность ленты
JOIN tape_speed ON fr.tape_recipe_id = tape_speed.recipe_id
JOIN tape_length ON tape_speed.density_id = tape_length.density_id
JOIN tape_density td ON tape_speed.density_id = td.id
JOIN color c ON fr.color_id = c.id
JOIN additive a ON fr.additive_id = a.id

-- Количество для основы
LEFT JOIN warp_quantity wq_warp ON yt.yarn_name = 'warp' AND fr.quantity_id = wq_warp.warp_id

-- Количество для утка
LEFT JOIN weft_quantity wq_weft ON yt.yarn_name = 'weft' AND fr.quantity_id = wq_weft.weft_id

GROUP BY
    l.loom_number,
    yt.yarn_name,
    td.density,
    c.color,
    a.additive

ORDER BY
    l.loom_number,
    yt.yarn_name,
    td.density;