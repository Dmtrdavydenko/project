INSERT INTO user_session
(session_id,user_id,ip,user_agent,expires_at)
VALUES
(?,?,?,?,DATE_ADD(NOW(), INTERVAL 1 DAY));