SELECT
    u.user_id,
    u.login,
    p.fio,
    p.birth_date
FROM users u
LEFT JOIN user_profile p
    ON p.user_id = u.user_id
WHERE u.user_id = ?;