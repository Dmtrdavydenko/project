select loom_number, looms.fabric_recipe_id, model_of_the_loom_id from looms
JOIN loom_machine on looms.model_of_the_loom_id = loom_machine.id
ORDER BY looms.loom_number ASC