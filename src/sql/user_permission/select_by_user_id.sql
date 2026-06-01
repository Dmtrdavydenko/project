SELECT permission_name, description
FROM user_role ur
JOIN role_permission rp ON rp.role_id = ur.role_id
JOIN permissions p ON p.permission_id = rp.permission_id
WHERE ur.user_id = ?