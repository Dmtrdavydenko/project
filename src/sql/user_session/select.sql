SELECT user_id
FROM user_session
WHERE session_id = ?
AND expires_at > NOW();