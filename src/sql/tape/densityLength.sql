select 
density, 
length 
from tape_density
JOIN tape_length ON tape_length.density_id = tape_density.id