-- Optional: create rows in `pages` for CMS menu slugs (idempotent; no unique on page_name required)
INSERT INTO pages (page_name) SELECT 'home' WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_name = 'home');
INSERT INTO pages (page_name) SELECT 'products' WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_name = 'products');
INSERT INTO pages (page_name) SELECT 'about_us' WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_name = 'about_us');
INSERT INTO pages (page_name) SELECT 'contact_us' WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_name = 'contact_us');
INSERT INTO pages (page_name) SELECT 'header_footer' WHERE NOT EXISTS (SELECT 1 FROM pages WHERE page_name = 'header_footer');
