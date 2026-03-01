BEGIN;

-- Apple-like categories (US storefront style)
INSERT INTO products_category (name, slug)
VALUES
  ('iPhone', 'iphone'),
  ('Mac', 'mac'),
  ('iPad', 'ipad'),
  ('Apple Watch', 'apple-watch'),
  ('AirPods', 'airpods'),
  ('TV & Home', 'tv-home'),
  ('Accessories', 'accessories')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name;

-- Apple-like products priced in COP (1 USD = 4000 COP)
INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'iphone'), 'iPhone 16 Pro 128GB', 'iphone-16-pro-128gb', 3996000.00, 'https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/1.webp', 'Pro performance with A-series chip, advanced camera system, and a premium titanium design built for power users.', 119600.00, 39600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'iphone'), 'iPhone 16 128GB', 'iphone-16-128gb', 3196000.00, 'https://cdn.dummyjson.com/product-images/smartphones/iphone-x/1.webp', 'Balanced everyday flagship with great battery life, powerful performance, and an excellent dual-camera setup.', 95600.00, 39600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'iphone'), 'iPhone SE 128GB', 'iphone-se-128gb', 1716000.00, 'https://cdn.dummyjson.com/product-images/smartphones/iphone-6/1.webp', 'Compact and affordable iPhone experience with strong performance and iOS features in a classic form factor.', 51600.00, 31600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'mac'), 'MacBook Air 13-inch M3 256GB', 'macbook-air-13-m3-256gb', 4396000.00, 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp', 'Ultra-portable laptop with Apple silicon efficiency, fanless design, and all-day battery life for work and study.', 131600.00, 51600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'mac'), 'MacBook Pro 14-inch M3 Pro 512GB', 'macbook-pro-14-m3-pro-512gb', 7996000.00, 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp', 'Professional notebook with high CPU/GPU performance, bright Liquid Retina XDR display, and versatile connectivity.', 239600.00, 59600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'mac'), 'iMac 24-inch M3 256GB', 'imac-24-m3-256gb', 5196000.00, 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp', 'Colorful all-in-one desktop that combines elegant design, Apple silicon speed, and a stunning 4.5K Retina display.', 155600.00, 79600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'mac'), 'Mac mini M2 256GB', 'mac-mini-m2-256gb', 2396000.00, 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp', 'Compact desktop with strong performance and low power usage, ideal for home offices and developer environments.', 71600.00, 35600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'ipad'), 'iPad Pro 11-inch M4 256GB', 'ipad-pro-11-m4-256gb', 3996000.00, 'https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/1.webp', 'High-end tablet with Apple silicon performance, pro display technology, and support for creative workflows.', 119600.00, 39600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'ipad'), 'iPad Air 11-inch M2 128GB', 'ipad-air-11-m2-128gb', 2396000.00, 'https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/1.webp', 'Versatile tablet offering excellent performance, slim design, and compatibility with modern productivity accessories.', 71600.00, 35600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'ipad'), 'iPad 10th Gen 64GB', 'ipad-10th-gen-64gb', 1396000.00, 'https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/1.webp', 'Entry-level iPad great for browsing, streaming, note-taking, and family use with a modern full-screen design.', 43600.00, 31600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'apple-watch'), 'Apple Watch Series 10 GPS 42mm', 'apple-watch-series-10-gps-42mm', 1596000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp', 'Smartwatch focused on health tracking, fitness metrics, and seamless iPhone integration in a refined design.', 47600.00, 27600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'apple-watch'), 'Apple Watch Ultra 2 GPS + Cellular 49mm', 'apple-watch-ultra-2-49mm', 3196000.00, 'https://cdn.dummyjson.com/product-images/mens-watches/rolex-submariner-watch/1.webp', 'Rugged, adventure-ready watch with advanced outdoor features, long battery life, and precision dual-frequency GPS.', 95600.00, 35600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'apple-watch'), 'Apple Watch SE GPS 44mm', 'apple-watch-se-gps-44mm', 996000.00, 'https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/1.webp', 'Affordable Apple Watch that covers essential fitness, notifications, and safety features for everyday use.', 31600.00, 27600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'airpods'), 'AirPods Pro (2nd generation) USB-C', 'airpods-pro-2-usb-c', 996000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp', 'Premium in-ear audio with active noise cancellation, transparency mode, and adaptive audio experiences.', 31600.00, 23600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'airpods'), 'AirPods (3rd generation)', 'airpods-3rd-generation', 716000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp', 'Open-fit wireless earbuds with spatial audio support and improved battery life for daily listening.', 23600.00, 23600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'airpods'), 'AirPods Max USB-C', 'airpods-max-usb-c', 2196000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp', 'Over-ear high-fidelity headphones with immersive sound, noise cancellation, and premium build quality.', 67600.00, 31600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'tv-home'), 'Apple TV 4K 128GB', 'apple-tv-4k-128gb', 596000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/tv-studio-camera-pedestal/1.webp', '4K streaming device with powerful performance, Dolby Vision support, and deep integration with Apple services.', 19600.00, 23600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'tv-home'), 'HomePod (2nd generation)', 'homepod-2nd-generation', 1196000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/1.webp', 'Smart speaker delivering rich room-filling sound, Siri control, and home automation capabilities.', 35600.00, 27600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'tv-home'), 'HomePod mini', 'homepod-mini', 396000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/1.webp', 'Compact smart speaker with balanced sound and seamless multi-room audio for Apple ecosystem users.', 11600.00, 19600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'accessories'), 'Magic Keyboard for iPad Pro 11-inch', 'magic-keyboard-ipad-pro-11', 1196000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/iphone-12-silicone-case-with-magsafe-plum/1.webp', 'Floating cantilever keyboard with trackpad that transforms iPad Pro into a portable productivity setup.', 35600.00, 27600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'accessories'), 'Apple Pencil Pro', 'apple-pencil-pro', 516000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/selfie-lamp-with-iphone/1.webp', 'Advanced stylus for drawing and note-taking with precision input and new squeeze interactions.', 15600.00, 19600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO products ("categoryId", name, slug, price, image, description, product_fee, delivery_fee)
VALUES ((SELECT id FROM products_category WHERE slug = 'accessories'), 'MagSafe Charger', 'magsafe-charger', 156000.00, 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-magsafe-battery-pack/1.webp', 'Magnetic wireless charging accessory designed for convenient and reliable iPhone charging.', 7600.00, 15600.00)
ON CONFLICT (slug) DO UPDATE SET "categoryId" = EXCLUDED."categoryId", name = EXCLUDED.name, price = EXCLUDED.price, image = EXCLUDED.image, description = EXCLUDED.description, product_fee = EXCLUDED.product_fee, delivery_fee = EXCLUDED.delivery_fee;

COMMIT;
