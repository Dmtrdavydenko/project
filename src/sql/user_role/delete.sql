DELETE FROM user_role
WHERE (user_id, role_id) = (?, ?);