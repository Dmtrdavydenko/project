select 
tl.id,
density_id,
class_yarn_id,
density,
length,
length*density/1000000 as weight
from tape_length tl
join tape_density td on tl.density_id = td.id
order by class_yarn_id, density_id