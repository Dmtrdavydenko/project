select loom_number, name, ppm, shuttle from looms
JOIN loom_machine ON looms.machine_id = loom_machine.id
ORDER BY loom_number ASC;