-- Add boolean status to page_images (active = true, inactive = false).
-- Run once on existing databases:
--   psql "$DATABASE_URL" -f sql/migration_add_page_images_status.sql

ALTER TABLE page_images
  ADD COLUMN IF NOT EXISTS status BOOLEAN NOT NULL DEFAULT TRUE;

-- Optional: example updates
-- UPDATE page_images SET status = FALSE WHERE id = 1;
-- UPDATE page_images SET status = TRUE WHERE section_id = 2;
