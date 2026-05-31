INSERT INTO user_profile (user_id, fio, birth_date)
VALUES (?, ?, ?)
ON DUPLICATE KEY UPDATE
fio = VALUES(fio),
birth_date = VALUES(birth_date);