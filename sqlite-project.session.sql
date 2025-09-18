SELECT name, type FROM sqlite_master WHERE type IN ('table');

PRAGMA table_info(accounts_user);

SELECT * FROM accounts_user;

INSERT INTO accounts_user (password, is_superuser, username, last_login, is_staff, is_active, date_joined, first_name, last_name, email)
VALUES ('admin', 1, 'suresh', datetime('now'), 1, 1, datetime('now'), 'nenavath', 'suresh', 'suryanss143@gmail.com');

delete from accounts_user where id = 1;