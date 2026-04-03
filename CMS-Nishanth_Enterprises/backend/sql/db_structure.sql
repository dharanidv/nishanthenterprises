-- Table: pages (CMS page registry)
-- Run with: psql "$DATABASE_URL" -f sql/pages.sql

CREATE TABLE IF NOT EXISTS pages (
  id BIGSERIAL PRIMARY KEY,
  page_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-refresh updated_at on row updates (idempotent if function already exists)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_pages_set_updated_at ON pages;
CREATE TRIGGER trg_pages_set_updated_at
BEFORE UPDATE ON pages
FOR EACH ROW
EXECUTE PROCEDURE set_updated_at();

-- ---------------------------------------------------------------------------
-- page_section: content blocks per page (uses created_time / updated_time)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS page_section (
  id BIGSERIAL PRIMARY KEY,
  section_name VARCHAR(255) NOT NULL,
  page_id BIGINT NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  section_content TEXT,
  created_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_section_page_id ON page_section (page_id);

-- ---------------------------------------------------------------------------
-- page_images: images linked to a section (uses created_time / updated_time)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS page_images (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  section_id BIGINT NOT NULL REFERENCES page_section (id) ON DELETE CASCADE,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_images_section_id ON page_images (section_id);

-- Auto-refresh updated_time on UPDATE (for tables that use created_time / updated_time)
CREATE OR REPLACE FUNCTION set_updated_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_time = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_page_section_set_updated_time ON page_section;
CREATE TRIGGER trg_page_section_set_updated_time
BEFORE UPDATE ON page_section
FOR EACH ROW
EXECUTE PROCEDURE set_updated_time();

DROP TRIGGER IF EXISTS trg_page_images_set_updated_time ON page_images;
CREATE TRIGGER trg_page_images_set_updated_time
BEFORE UPDATE ON page_images
FOR EACH ROW
EXECUTE PROCEDURE set_updated_time();

CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL,
  image_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subcategories (
  id BIGSERIAL PRIMARY KEY,
  subcategory_name VARCHAR(255) NOT NULL,
  category_id BIGINT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
  image_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories (category_id);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,

  subcategory_id BIGINT NOT NULL REFERENCES subcategories (id) ON DELETE CASCADE,

  description TEXT,

  original_price NUMERIC(10, 2),
  offer_price NUMERIC(10, 2),

  -- CMS dropdown: inhouse | branded | hot | cold | NULL
  classification VARCHAR(50) CHECK (
    classification IN ('inhouse', 'branded', 'hot', 'cold') OR classification IS NULL
  ),

  is_new_product BOOLEAN NOT NULL DEFAULT FALSE,
  is_popular_product BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id BIGSERIAL PRIMARY KEY,

  product_id BIGINT NOT NULL REFERENCES products (id) ON DELETE CASCADE,

  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products (subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_classification ON products (classification);
CREATE INDEX IF NOT EXISTS idx_products_is_new_product ON products (is_new_product);
CREATE INDEX IF NOT EXISTS idx_products_is_popular_product ON products (is_popular_product);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);

CREATE OR REPLACE FUNCTION set_updated_time_common()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Categories
DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE PROCEDURE set_updated_time_common();

-- Subcategories
DROP TRIGGER IF EXISTS trg_subcategories_updated_at ON subcategories;
CREATE TRIGGER trg_subcategories_updated_at
BEFORE UPDATE ON subcategories
FOR EACH ROW
EXECUTE PROCEDURE set_updated_time_common();

-- Products
DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE set_updated_time_common();

-- Product Images
DROP TRIGGER IF EXISTS trg_product_images_updated_at ON product_images;
CREATE TRIGGER trg_product_images_updated_at
BEFORE UPDATE ON product_images
FOR EACH ROW
EXECUTE PROCEDURE set_updated_time_common();
