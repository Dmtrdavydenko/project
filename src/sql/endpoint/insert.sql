INSERT INTO user_endpoints (
    endpoint,
    ip,
    user_agent,
    language
)

VALUES (?, ?, ?, ?)

ON DUPLICATE KEY UPDATE

    ip = VALUES(ip),
    user_agent = VALUES(user_agent),
    language = VALUES(language),
    last_visit = CURRENT_TIMESTAMP;