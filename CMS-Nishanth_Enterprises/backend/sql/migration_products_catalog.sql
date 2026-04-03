-- Align existing databases with catalog schema (run once if tables already exist).
-- Safe to re-run: uses IF EXISTS / IF NOT EXISTS checks where applicable.

-- Rename legacy column product_type -> classification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'product_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'classification'
  ) THEN
    ALTER TABLE products RENAME COLUMN product_type TO classification;
  END IF;
END $$;

ALTER TABLE product_images
  ADD COLUMN IF NOT EXISTS display_order INT NOT NULL DEFAULT 0;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE subcategories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_products_classification ON products (classification);
CREATE INDEX IF NOT EXISTS idx_products_is_new_product ON products (is_new_product);
CREATE INDEX IF NOT EXISTS idx_products_is_popular_product ON products (is_popular_product);
