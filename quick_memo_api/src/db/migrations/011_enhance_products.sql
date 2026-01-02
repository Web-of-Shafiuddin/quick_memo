-- Add description and video_url to products
ALTER TABLE products ADD COLUMN description TEXT;
ALTER TABLE products ADD COLUMN video_url TEXT;

-- Create product_gallery_images table
CREATE TABLE IF NOT EXISTS product_gallery_images (
    gallery_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id INT NOT NULL,
    image_url TEXT NOT NULL,
    attribute_value VARCHAR(100), -- Nullable: link image to specific variant value (e.g. 'Red')
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS product_gallery_images_product_id_idx ON product_gallery_images(product_id);
