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

-- Apple-like products for US market reference
INSERT INTO products (
  "categoryId",
  name,
  slug,
  price,
  image,
  description,
  product_fee,
  delivery_fee
)
VALUES
  ((SELECT id FROM products_category WHERE slug = 'iphone'), 'iPhone 16 Pro 128GB', 'iphone-16-pro-128gb', 999.00, 'https://www.apple.com/v/iphone/home/images/meta/iphone__kqge21l9n26q_og.png', 'Pro performance with A-series chip, advanced camera system, and a premium titanium design built for power users.', 29.90, 9.90),
  ((SELECT id FROM products_category WHERE slug = 'iphone'), 'iPhone 16 128GB', 'iphone-16-128gb', 799.00, 'https://www.apple.com/v/iphone/home/images/meta/iphone__kqge21l9n26q_og.png', 'Balanced everyday flagship with great battery life, powerful performance, and an excellent dual-camera setup.', 23.90, 9.90),
  ((SELECT id FROM products_category WHERE slug = 'iphone'), 'iPhone SE 128GB', 'iphone-se-128gb', 429.00, 'https://www.apple.com/v/iphone/home/images/meta/iphone__kqge21l9n26q_og.png', 'Compact and affordable iPhone experience with strong performance and iOS features in a classic form factor.', 12.90, 7.90),

  ((SELECT id FROM products_category WHERE slug = 'mac'), 'MacBook Air 13-inch M3 256GB', 'macbook-air-13-m3-256gb', 1099.00, 'https://www.apple.com/v/macbook-air/s/images/meta/macbook-air_overview__f0j5tp0x83mi_og.png', 'Ultra-portable laptop with Apple silicon efficiency, fanless design, and all-day battery life for work and study.', 32.90, 12.90),
  ((SELECT id FROM products_category WHERE slug = 'mac'), 'MacBook Pro 14-inch M3 Pro 512GB', 'macbook-pro-14-m3-pro-512gb', 1999.00, 'https://www.apple.com/v/macbook-pro/am/images/meta/macbook-pro_overview__bcsyunk73i2a_og.png', 'Professional notebook with high CPU/GPU performance, bright Liquid Retina XDR display, and versatile connectivity.', 59.90, 14.90),
  ((SELECT id FROM products_category WHERE slug = 'mac'), 'iMac 24-inch M3 256GB', 'imac-24-m3-256gb', 1299.00, 'https://www.apple.com/v/imac/home/bn/images/meta/imac__fpl5d3f8xouq_og.png', 'Colorful all-in-one desktop that combines elegant design, Apple silicon speed, and a stunning 4.5K Retina display.', 38.90, 19.90),
  ((SELECT id FROM products_category WHERE slug = 'mac'), 'Mac mini M2 256GB', 'mac-mini-m2-256gb', 599.00, 'https://www.apple.com/v/mac-mini/s/images/meta/mac-mini_overview__b1uqo4kltxyu_og.png', 'Compact desktop with strong performance and low power usage, ideal for home offices and developer environments.', 17.90, 8.90),

  ((SELECT id FROM products_category WHERE slug = 'ipad'), 'iPad Pro 11-inch M4 256GB', 'ipad-pro-11-m4-256gb', 999.00, 'https://www.apple.com/v/ipad-pro/ao/images/meta/ipad-pro_overview__b9drz4n6xemu_og.png', 'High-end tablet with Apple silicon performance, pro display technology, and support for creative workflows.', 29.90, 9.90),
  ((SELECT id FROM products_category WHERE slug = 'ipad'), 'iPad Air 11-inch M2 128GB', 'ipad-air-11-m2-128gb', 599.00, 'https://www.apple.com/v/ipad-air/s/images/meta/ipad-air_overview__cez6t0z9g1yq_og.png', 'Versatile tablet offering excellent performance, slim design, and compatibility with modern productivity accessories.', 17.90, 8.90),
  ((SELECT id FROM products_category WHERE slug = 'ipad'), 'iPad 10th Gen 64GB', 'ipad-10th-gen-64gb', 349.00, 'https://www.apple.com/v/ipad/home/cd/images/meta/ipad__bq6djchifrv6_og.png', 'Entry-level iPad great for browsing, streaming, note-taking, and family use with a modern full-screen design.', 10.90, 7.90),

  ((SELECT id FROM products_category WHERE slug = 'apple-watch'), 'Apple Watch Series 10 GPS 42mm', 'apple-watch-series-10-gps-42mm', 399.00, 'https://www.apple.com/v/apple-watch-series-10/a/images/meta/apple-watch-series-10__dwduv2wkqxeu_og.png', 'Smartwatch focused on health tracking, fitness metrics, and seamless iPhone integration in a refined design.', 11.90, 6.90),
  ((SELECT id FROM products_category WHERE slug = 'apple-watch'), 'Apple Watch Ultra 2 GPS + Cellular 49mm', 'apple-watch-ultra-2-49mm', 799.00, 'https://www.apple.com/v/apple-watch-ultra-2/d/images/meta/apple-watch-ultra-2__f0v7s7x6l2mm_og.png', 'Rugged, adventure-ready watch with advanced outdoor features, long battery life, and precision dual-frequency GPS.', 23.90, 8.90),
  ((SELECT id FROM products_category WHERE slug = 'apple-watch'), 'Apple Watch SE GPS 44mm', 'apple-watch-se-gps-44mm', 249.00, 'https://www.apple.com/v/apple-watch-se/r/images/meta/apple-watch-se__f70y5u6fsu66_og.png', 'Affordable Apple Watch that covers essential fitness, notifications, and safety features for everyday use.', 7.90, 6.90),

  ((SELECT id FROM products_category WHERE slug = 'airpods'), 'AirPods Pro (2nd generation) USB-C', 'airpods-pro-2-usb-c', 249.00, 'https://www.apple.com/v/airpods-pro/m/images/meta/airpods-pro_overview__d8b4w7f34d2q_og.png', 'Premium in-ear audio with active noise cancellation, transparency mode, and adaptive audio experiences.', 7.90, 5.90),
  ((SELECT id FROM products_category WHERE slug = 'airpods'), 'AirPods (3rd generation)', 'airpods-3rd-generation', 179.00, 'https://www.apple.com/v/airpods/s/images/meta/airpods__eb24cvhoe26a_og.png', 'Open-fit wireless earbuds with spatial audio support and improved battery life for daily listening.', 5.90, 5.90),
  ((SELECT id FROM products_category WHERE slug = 'airpods'), 'AirPods Max USB-C', 'airpods-max-usb-c', 549.00, 'https://www.apple.com/v/airpods-max/s/images/meta/airpods-max_overview__f9s4z4b0tnaa_og.png', 'Over-ear high-fidelity headphones with immersive sound, noise cancellation, and premium build quality.', 16.90, 7.90),

  ((SELECT id FROM products_category WHERE slug = 'tv-home'), 'Apple TV 4K 128GB', 'apple-tv-4k-128gb', 149.00, 'https://www.apple.com/v/apple-tv-4k/u/images/meta/apple-tv-4k__f2w2f4r8ln6e_og.png', '4K streaming device with powerful performance, Dolby Vision support, and deep integration with Apple services.', 4.90, 5.90),
  ((SELECT id FROM products_category WHERE slug = 'tv-home'), 'HomePod (2nd generation)', 'homepod-2nd-generation', 299.00, 'https://www.apple.com/v/homepod-2nd-generation/c/images/meta/homepod-2nd-gen__drxnmh6d8l2a_og.png', 'Smart speaker delivering rich room-filling sound, Siri control, and home automation capabilities.', 8.90, 6.90),
  ((SELECT id FROM products_category WHERE slug = 'tv-home'), 'HomePod mini', 'homepod-mini', 99.00, 'https://www.apple.com/v/homepod-mini/j/images/meta/homepod-mini__bn2jcc0m5h1a_og.png', 'Compact smart speaker with balanced sound and seamless multi-room audio for Apple ecosystem users.', 2.90, 4.90),

  ((SELECT id FROM products_category WHERE slug = 'accessories'), 'Magic Keyboard for iPad Pro 11-inch', 'magic-keyboard-ipad-pro-11', 299.00, 'https://www.apple.com/v/ipad-keyboards/j/images/meta/ipad-keyboards__f6m6h7w8u9v0_og.png', 'Floating cantilever keyboard with trackpad that transforms iPad Pro into a portable productivity setup.', 8.90, 6.90),
  ((SELECT id FROM products_category WHERE slug = 'accessories'), 'Apple Pencil Pro', 'apple-pencil-pro', 129.00, 'https://www.apple.com/v/apple-pencil-pro/a/images/meta/apple-pencil-pro__es29u9wzdqie_og.png', 'Advanced stylus for drawing and note-taking with precision input and new squeeze interactions.', 3.90, 4.90),
  ((SELECT id FROM products_category WHERE slug = 'accessories'), 'MagSafe Charger', 'magsafe-charger', 39.00, 'https://www.apple.com/v/magsafe-charger/c/images/meta/magsafe-charger__d9w3z7m8q1ny_og.png', 'Magnetic wireless charging accessory designed for convenient and reliable iPhone charging.', 1.90, 3.90)
ON CONFLICT (slug) DO UPDATE SET
  "categoryId" = EXCLUDED."categoryId",
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  product_fee = EXCLUDED.product_fee,
  delivery_fee = EXCLUDED.delivery_fee;

COMMIT;
