INSERT INTO user_profiles (

    login,
    ip,
    user_agent,
    language

)

VALUES (?, ?, ?, ?)

ON DUPLICATE KEY UPDATE

    ip = VALUES(ip),

    user_agent = VALUES(user_agent),

    language = VALUES(language),

    last_login = CURRENT_TIMESTAMP;