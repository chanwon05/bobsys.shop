-- Run once against the existing database with the updated backend stopped.
-- Hibernate ddl-auto=update does not remove obsolete columns.
ALTER TABLE products DROP COLUMN status;
