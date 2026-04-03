-- Add subcategories between categories and products (run once on existing DBs).
-- After: products.subcategory_id -> subcategories -> categories.

CREATE TABLE IF NOT EXISTS subcategories (
  id BIGSERIAL PRIMARY KEY,
  subcategory_name VARCHAR(255) NOT NULL,
  category_id BIGINT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories (category_id);

-- Requires set_updated_time_common() from main schema (db_structure.sql).
DROP TRIGGER IF EXISTS trg_subcategories_updated_at ON subcategories;
CREATE TRIGGER trg_subcategories_updated_at
BEFORE UPDATE ON subcategories
FOR EACH ROW
EXECUTE PROCEDURE set_updated_time_common();

-- Link products to subcategories (from legacy category_id)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id BIGINT;

    INSERT INTO subcategories (subcategory_name, category_id)
    SELECT 'General', c.id
    FROM categories c
    WHERE NOT EXISTS (
      SELECT 1 FROM subcategories s WHERE s.category_id = c.id AND s.subcategory_name = 'General'
    );

    UPDATE products p
    SET subcategory_id = s.id
    FROM subcategories s
    WHERE s.category_id = p.category_id
      AND s.subcategory_name = 'General'
      AND p.subcategory_id IS NULL;

    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
    ALTER TABLE products DROP COLUMN IF EXISTS category_id;

    ALTER TABLE products ALTER COLUMN subcategory_id SET NOT NULL;
    ALTER TABLE products
      ADD CONSTRAINT products_subcategory_id_fkey
      FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE CASCADE;

    DROP INDEX IF EXISTS idx_products_category_id;
    CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products (subcategory_id);
  END IF;
END $$;

-- Fresh partial state: column subcategory_id exists but no category_id (already migrated)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'subcategory_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'products'
      AND constraint_name = 'products_subcategory_id_fkey'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_subcategory_id_fkey
      FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products (subcategory_id);
  END IF;
END $$;
