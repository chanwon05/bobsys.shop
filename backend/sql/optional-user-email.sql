-- Preserve existing addresses while allowing username-only accounts.
ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL;
