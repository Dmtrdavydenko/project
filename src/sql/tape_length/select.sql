SELECT 
tl.id,
-- density_id,
-- class_yarn_id,
yt.yarn_name AS type,
density,
length,
length*density/1000000 AS weight
FROM tape_length tl
JOIN tape_density td ON tl.density_id = td.id
JOIN yarn_type yt ON tl.class_yarn_id = yt.yarn_id
ORDER BY class_yarn_id, density_id