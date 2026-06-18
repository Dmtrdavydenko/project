SELECT 
tl.id,
density_id,
class_yarn_id,
density,
length,
length*density/1000000 AS weight
FROM tape_length tl
JOIN tape_density td ON tl.density_id = td.id
ORDER BY class_yarn_id, density_id