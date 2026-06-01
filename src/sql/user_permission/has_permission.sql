SELECT 1
FROM role_permission rp
JOIN user_role ur ON ur.role_id = rp.role_id
JOIN permissions p ON p.permission_id = rp.permission_id
WHERE ur.user_id = ?
AND p.permission_name = ?
LIMIT 1;