SELECT
    t.yarn_type,
    t.density,
    t.color,
    t.additive,

    COUNT(*) AS positions_count,

    /* =========================================
       ОБЩИЙ РАСХОД ЛЕНТЫ
    ========================================= */

    ROUND(
        SUM(t.consumption_per_shift),
        2
    ) AS total_consumption_shift,

    ROUND(
        SUM(t.consumption_per_min),
        2
    ) AS total_consumption_min,

    /* =========================================
       МЕТРЫ ТКАНИ
    ========================================= */

    ROUND(
        SUM(t.fabric_meter_shift),
        2
    ) AS total_fabric_meter_shift,

    ROUND(
        SUM(t.fabric_meter_min),
        2
    ) AS total_fabric_meter_min,

    /* =========================================
       ДЕБАГ УТОКА

       total_threads_10cm
       сколько уточных нитей приходится
       на 10 см ткани

       total_weft_cm
       сколько сантиметров ткани
       покрывает группа лент

       пример:
       2 утка по 19

       38 нитей / 10 см
       каждая лента:
       19 нитей / 5 см

       поэтому:
       10 / weft_count
    ========================================= */

    ROUND(
        SUM(t.total_threads_10cm),
        2
    ) AS total_threads_10cm,

    ROUND(
        SUM(t.total_weft_cm),
        2
    ) AS total_weft_cm,

    /* =========================================
       ОСНОВА
    ========================================= */

    ROUND(
        SUM(t.total_threads_width),
        2
    ) AS total_threads_width

FROM (

    /* =====================================================
       ОСНОВА
    ===================================================== */

    SELECT
        l.loom_number,

        'warp' AS yarn_type,

        td.density,
        c.color,
        a.additive,

        speed.speed_m_min AS fabric_meter_min,

        speed.speed_m_min * 720 AS fabric_meter_shift,

        /* =====================================
           ОСНОВА
        ===================================== */

        wq_warp.warp_quantity AS total_threads_width,

        0 AS total_threads_10cm,

        0 AS total_weft_cm,

        /* =====================================
           РАСХОД ОСНОВЫ

           скорость ткани × кол-во нитей
        ===================================== */

        ROUND(
            speed.speed_m_min
            * wq_warp.warp_quantity,
            4
        ) AS consumption_per_min,

        ROUND(
            speed.speed_m_min
            * wq_warp.warp_quantity
            * 720,
            4
        ) AS consumption_per_shift

    FROM looms l

    JOIN (

        /* =====================================
           СКОРОСТЬ ТКАНИ

           ppm = прокидки в минуту

           если:
           1 уток 39/10см

           скорость:
           1200 / (39*10)

           если:
           2 утка по 19

           фактически:
           38 нитей / 10 см

           но каждый челнок работает
           только половину ppm

           поэтому:

           (ppm / weft_count)
           /
           (weft_quantity * 10)

        ===================================== */

        SELECT
            l2.loom_number,

            lm2.ppm,

            COUNT(*) AS weft_count,

            MAX(wq2.weft_quantity) AS weft_quantity,

            ROUND(
                (
                    lm2.ppm / COUNT(*)
                )
                /
                (
                    MAX(wq2.weft_quantity) * 10
                ),
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

        GROUP BY
            l2.loom_number,
            lm2.ppm

    ) speed

        ON l.loom_number = speed.loom_number

    JOIN fabric_recipe fr
        ON l.fabric_recipe_id = fr.fabric_recipe_id

    JOIN yarn_type yt
        ON fr.yarn_id = yt.yarn_id
       AND yt.yarn_name = 'warp'

    LEFT JOIN warp_quantity wq_warp
        ON fr.quantity_id = wq_warp.warp_id

    JOIN tape_speed ts
        ON fr.tape_recipe_id = ts.recipe_id

    JOIN tape_density td
        ON ts.density_id = td.id

    JOIN color c
        ON fr.color_id = c.id

    JOIN additive a
        ON fr.additive_id = a.id

    UNION ALL

    /* =====================================================
       УТОК
    ===================================================== */

    SELECT
        l.loom_number,

        'weft' AS yarn_type,

        td.density,
        c.color,
        a.additive,

        speed.speed_m_min AS fabric_meter_min,

        speed.speed_m_min * 720 AS fabric_meter_shift,

        /* =====================================
           ОСНОВА НЕ ИСПОЛЬЗУЕТСЯ
        ===================================== */

        0 AS total_threads_width,

        /* =====================================
           КОЛ-ВО НИТЕЙ НА 10 СМ

           НЕ ДЕЛИМ НА weft_count

           потому что:

           2 ленты по 19
           = 38 нитей / 10 см ткани

           каждая лента участвует
           в общей плотности ткани

        ===================================== */

        wq.weft_quantity AS total_threads_10cm,

        /* =====================================
           СКОЛЬКО СМ ПОКРЫВАЕТ ЛЕНТА

           10 см / кол-во утков

           пример:

           2 утка:
           каждая лента работает
           на 5 см ткани

        ===================================== */

        (
            10 / speed.weft_count
        ) AS total_weft_cm,

        /* =====================================
           РАСХОД УТКА

           скорость ткани
           × ширина рукава
           × нитей на 1 метр

           нитей на метр:

           weft_quantity * 100

           потому что:
           39 нитей / 10 см
           = 390 нитей / метр

        ===================================== */

        ROUND(
            (
                speed.speed_m_min
                *
                (
                    sw.sleeve_width * 2 / 100
                )
                *
                (
                    wq.weft_quantity * 10
                )
            ),
            4
        ) AS consumption_per_min,

        ROUND(
            (
                speed.speed_m_min
                *
                (
                    sw.sleeve_width * 2 / 100
                )
                *
                (
                    wq.weft_quantity * 10
                )
            ) * 720,
            4
        ) AS consumption_per_shift

    FROM looms l

    JOIN (

        SELECT
            l2.loom_number,

            lm2.ppm,

            COUNT(*) AS weft_count,

            MAX(wq2.weft_quantity) AS weft_quantity,

            ROUND(
                (
                    lm2.ppm / COUNT(*)
                )
                /
                (
                    MAX(wq2.weft_quantity) * 10
                ),
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

        GROUP BY
            l2.loom_number,
            lm2.ppm

    ) speed

        ON l.loom_number = speed.loom_number

    JOIN fabric_recipe fr
        ON l.fabric_recipe_id = fr.fabric_recipe_id

    JOIN yarn_type yt
        ON fr.yarn_id = yt.yarn_id
       AND yt.yarn_name = 'weft'

    LEFT JOIN weft_quantity wq
        ON fr.quantity_id = wq.weft_id

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

) t

GROUP BY
    t.yarn_type,
    t.density,
    t.color,
    t.additive

/*
ORDER BY
    t.yarn_type,
    t.density,
    t.color;
*/
ORDER BY
    t.yarn_type,
   -- t.density,
   -- t.color,
    total_consumption_shift;