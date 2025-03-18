-- Create default admin user if it doesn't exist
INSERT INTO users (username, password, role, full_name, email)
VALUES (
    'admin',
    '$2b$10$YourHashedPasswordHere', -- Dit wordt vervangen door een echte gehashte password
    'admin',
    'Administrator',
    'admin@example.com'
)
ON CONFLICT (username) DO NOTHING; 