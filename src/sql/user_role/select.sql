SELECT 
  user_id,
  role_id,
  role_name,
  description,
  login
FROM user_role ur
JOIN roles r ON r.role_id = ur.role_id
JOIN users u ON u.user_id = ur.user_id;