SELECT
    fabric_id,
    sleeve_width as fabric_width,
    sleeve_density as fabric_density
FROM fabric fr
JOIN sleeve_width_density fwd ON fr.fabric_wd_id = fwd.sleeve_width_density_id 
JOIN sleeve_width fw   ON fwd.sleeve_width_id = fw.sleeve_width_id
JOIN sleeve_density fd ON fwd.sleeve_density_id = fd.sleeve_density_id;