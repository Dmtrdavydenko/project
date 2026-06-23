WITH base AS (
SELECT DISTINCT
    yt.yarn_name,
    td.density,
    c.color,
    a.additive,
    tl.length AS tape_length
FROM tape_extrusion te

LEFT JOIN tape_speed ts
    ON te.tape_id = ts.recipe_id
LEFT JOIN tape_density td
    ON ts.density_id = td.id
LEFT JOIN color c
    ON te.color_id = c.id
LEFT JOIN additive a
    ON te.additive_id = a.id
left JOIN tape_length tl ON ts.density_id = tl.density_id
left JOIN yarn_type yt ON tl.class_yarn_id = yt.yarn_id
),

consumption AS (

    SELECT
    t.yarn_type,
    t.density,
    t.color,
    t.additive,
    t.tape_length,

        COUNT(*) AS loom_positions_count,

        SUM(t.tape_consumption_per_min) AS tape_consumption_per_min,
        SUM(t.tape_consumption_per_shift) AS tape_consumption_per_shift,

        SUM(t.consumption_per_shift) / NULLIF(MAX(t.tape_length),0) AS tape_spool_usage,
        SUM(t.consumption_per_shift) / NULLIF(MAX(t.tape_length),0) / COUNT(*) AS tape_spool_usage_one,

        SUM(t.fabric_meter_min) AS fabric_production_per_min,
        SUM(t.fabric_meter_shift) AS fabric_production_per_shift,

        SUM(t.total_threads_10cm) AS ten_cm_tape_count,
        SUM(t.total_weft_cm) AS tape_weft_length_cm,
        SUM(t.total_threads_width) AS tape_warp_count

    FROM (


        SELECT
            l.loom_number,
            'warp' AS yarn_type,

            td.density,
            c.color,
            a.additive,
            tl.length AS tape_length,

            speed.speed_m_min AS fabric_meter_min,
            speed.speed_m_min * 720 AS fabric_meter_shift,

            wq_warp.warp_quantity AS total_threads_width,
            0 AS total_threads_10cm,
            0 AS total_weft_cm,

            ROUND(speed.speed_m_min * wq_warp.warp_quantity, 4) AS consumption_per_min,
            ROUND(speed.speed_m_min * wq_warp.warp_quantity * 720, 4) AS consumption_per_shift,

            ROUND(speed.speed_m_min * wq_warp.warp_quantity, 4) AS tape_consumption_per_min,
            ROUND(speed.speed_m_min * wq_warp.warp_quantity * 720, 4) AS tape_consumption_per_shift

        FROM looms l

        JOIN fabric_recipe fr
            ON l.fabric_recipe_id = fr.fabric_recipe_id

        JOIN yarn_type yt
            ON fr.yarn_id = yt.yarn_id
           AND yt.yarn_name = 'warp'

        JOIN loom_machine lm
            ON l.model_of_the_loom_id = lm.id

        JOIN tape_speed ts
            ON fr.tape_recipe_id = ts.recipe_id

        JOIN tape_density td
            ON ts.density_id = td.id

        JOIN color c
            ON fr.color_id = c.id

        JOIN additive a
            ON fr.additive_id = a.id

        JOIN tape_length tl
            ON tl.density_id = td.id
           AND tl.class_yarn_id = fr.yarn_id

        LEFT JOIN warp_quantity wq_warp
            ON fr.quantity_id = wq_warp.warp_id

        JOIN (
            SELECT
                l2.loom_number,
                lm2.ppm,
                COUNT(*) AS weft_count,
                MAX(wq2.weft_quantity) AS weft_quantity,
                ROUND(
                    (lm2.ppm / COUNT(*)) /
                    (MAX(wq2.weft_quantity) * 10),
                    4
                ) AS speed_m_min
            FROM looms l2
            JOIN loom_machine lm2
                ON l2.model_of_the_loom_id = lm2.id
            JOIN fabric_recipe fr2
                ON l2.fabric_recipe_id = fr2.fabric_recipe_id
            JOIN yarn_type yt2
                ON fr2.yarn_id = yt2.yarn_id
            LEFT JOIN weft_quantity wq2
                ON fr2.quantity_id = wq2.weft_id
            WHERE yt2.yarn_name = 'weft'
            GROUP BY l2.loom_number, lm2.ppm
        ) speed
            ON l.loom_number = speed.loom_number


        UNION ALL


        SELECT
            l.loom_number,
            'weft' AS yarn_type,

            td.density,
            c.color,
            a.additive,
            tl.length AS tape_length,

            speed.speed_m_min AS fabric_meter_min,
            speed.speed_m_min * 720 AS fabric_meter_shift,

            0 AS total_threads_width,
            wq.weft_quantity AS total_threads_10cm,
            (10 / speed.weft_count) AS total_weft_cm,

            ROUND(
                speed.speed_m_min *
                (sw.sleeve_width * 2 / 100) *
                (wq.weft_quantity * 10),
                4
            ) AS consumption_per_min,

            ROUND(
                speed.speed_m_min *
                (sw.sleeve_width * 2 / 100) *
                (wq.weft_quantity * 10) * 720,
                4
            ) AS consumption_per_shift,

            ROUND(
                speed.speed_m_min *
                (sw.sleeve_width * 2 / 100) *
                (wq.weft_quantity * 10),
                4
            ) AS tape_consumption_per_min,

            ROUND(
                speed.speed_m_min *
                (sw.sleeve_width * 2 / 100) *
                (wq.weft_quantity * 10) * 720,
                4
            ) AS tape_consumption_per_shift

        FROM looms l

        JOIN fabric_recipe fr
            ON l.fabric_recipe_id = fr.fabric_recipe_id

        JOIN yarn_type yt
            ON fr.yarn_id = yt.yarn_id
           AND yt.yarn_name = 'weft'

        JOIN loom_machine lm
            ON l.model_of_the_loom_id = lm.id

        JOIN sleeve_width_density swd
            ON fr.fabric_wd_id = swd.sleeve_width_density_id

        JOIN sleeve_width sw
            ON swd.sleeve_width_id = sw.sleeve_width_id

        JOIN tape_speed ts
            ON fr.tape_recipe_id = ts.recipe_id

        JOIN tape_density td
            ON ts.density_id = td.id

        JOIN color c
            ON fr.color_id = c.id

        JOIN additive a
            ON fr.additive_id = a.id

        JOIN tape_length tl
            ON tl.density_id = td.id
           AND tl.class_yarn_id = fr.yarn_id

        LEFT JOIN weft_quantity wq
            ON fr.quantity_id = wq.weft_id

        JOIN (
            SELECT
                l2.loom_number,
                lm2.ppm,
                COUNT(*) AS weft_count,
                MAX(wq2.weft_quantity) AS weft_quantity,
                ROUND(
                    (lm2.ppm / COUNT(*)) /
                    (MAX(wq2.weft_quantity) * 10),
                    4
                ) AS speed_m_min
            FROM looms l2
            JOIN loom_machine lm2
                ON l2.model_of_the_loom_id = lm2.id
            JOIN fabric_recipe fr2
                ON l2.fabric_recipe_id = fr2.fabric_recipe_id
            JOIN yarn_type yt2
                ON fr2.yarn_id = yt2.yarn_id
            LEFT JOIN weft_quantity wq2
                ON fr2.quantity_id = wq2.weft_id
            WHERE yt2.yarn_name = 'weft'
            GROUP BY l2.loom_number, lm2.ppm
        ) speed
            ON l.loom_number = speed.loom_number

    ) t

GROUP BY
    t.yarn_type,
    t.density,
    t.color,
    t.additive,
    t.tape_length
)

SELECT
    b.yarn_name,
    b.density,
    b.color,
    b.additive,
    b.tape_length,

    COALESCE(c.loom_positions_count, 0) AS loom_positions_count,
    COALESCE(c.tape_consumption_per_min, 0) AS tape_consumption_per_min,
    COALESCE(c.tape_consumption_per_shift, 0) AS tape_consumption_per_shift,
    COALESCE(c.tape_spool_usage, 0) AS tape_spool_usage,
    COALESCE(c.tape_spool_usage_one, 0) AS tape_spool_usage_one,
    COALESCE(c.fabric_production_per_min, 0) AS fabric_production_per_min,
    COALESCE(c.fabric_production_per_shift, 0) AS fabric_production_per_shift,
    COALESCE(c.ten_cm_tape_count, 0) AS ten_cm_tape_count,
    COALESCE(c.tape_weft_length_cm, 0) AS tape_weft_length_cm,
    COALESCE(c.tape_warp_count, 0) AS tape_warp_count

FROM base b

LEFT JOIN consumption c
    ON  c.density  = b.density
    AND c.color    = b.color
    AND c.additive = b.additive
    AND c.yarn_type = b.yarn_name

ORDER BY
    b.yarn_name,
    b.density,
    b.color,
    b.additive;